import OpenAI from "openai";
import { Router, type IRouter } from "express";
import { inArray } from "drizzle-orm";
import { db, imoveisTable } from "@workspace/db";
import {
  CompareImoveisBody,
  CompareImoveisResponse,
} from "@workspace/api-zod";
import { ensureDemoData, loadAvaliacoes } from "./imoveis";

const router: IRouter = Router();

type Categoria = "apartamento" | "condominio" | "proprietario" | "imobiliaria";

const categorias: Categoria[] = [
  "apartamento",
  "condominio",
  "proprietario",
  "imobiliaria",
];

type AiResult = {
  visaoGeral?: unknown;
  recomendacao?: unknown;
  imoveis?: Array<{
    id?: unknown;
    pontosPositivos?: unknown;
    pontosNegativos?: unknown;
  }>;
};

function strings(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);
}

router.post("/comparacoes", async (req, res): Promise<void> => {
  const body = CompareImoveisBody.safeParse(req.body);
  if (!body.success || new Set(body.data?.imovelIds ?? []).size !== body.data?.imovelIds.length) {
    res.status(400).json({ error: "Escolha de 2 a 4 imóveis diferentes para comparar." });
    return;
  }

  const selectedIds = body.data.imovelIds;
  await ensureDemoData();
  const [imoveis, avaliacoes] = await Promise.all([
    db.select().from(imoveisTable).where(inArray(imoveisTable.id, selectedIds)),
    loadAvaliacoes(),
  ]);

  if (imoveis.length !== selectedIds.length) {
    res.status(404).json({ error: "Um ou mais imóveis não foram encontrados." });
    return;
  }

  const ordered = selectedIds.map((id) => imoveis.find((imovel) => imovel.id === id)!);
  const base = ordered.map((imovel) => {
    const reviews = avaliacoes.filter((row) => row.avaliacao.imovelId === imovel.id);
    const notas = reviews.flatMap((row) =>
      categorias.flatMap((categoria) => {
        const nota = row.avaliacao.notas[categoria]?.nota;
        return typeof nota === "number" ? [nota] : [];
      }),
    );
    const mediaGeral = notas.length
      ? Number((notas.reduce((total, nota) => total + nota, 0) / notas.length).toFixed(1))
      : 0;
    const positivos = reviews.flatMap((row) =>
      categorias.flatMap((categoria) => {
        const item = row.avaliacao.notas[categoria];
        return item?.nota && item.nota >= 4 && item.comentario ? [item.comentario] : [];
      }),
    );
    const negativos = reviews.flatMap((row) => [
      ...categorias.flatMap((categoria) => {
        const item = row.avaliacao.notas[categoria];
        return item?.nota && item.nota <= 2 && item.comentario ? [item.comentario] : [];
      }),
      row.avaliacao.oQueGostariaDeSaber,
    ]);

    return {
      id: imovel.id,
      nome: imovel.nome,
      endereco: `${imovel.endereco} · ${imovel.bairro}`,
      mediaGeral,
      totalAvaliacoes: reviews.length,
      pontosPositivos: positivos.slice(0, 3),
      pontosNegativos: negativos.slice(0, 3),
    };
  });

  const highestRated = [...base].sort((a, b) => b.mediaGeral - a.mediaGeral)[0];
  const fallback = {
    imoveis: base.map((imovel) => ({
      ...imovel,
      pontosPositivos:
        imovel.pontosPositivos.length > 0
          ? imovel.pontosPositivos
          : ["Ainda não há elogios suficientes nas avaliações."],
      pontosNegativos:
        imovel.pontosNegativos.length > 0
          ? imovel.pontosNegativos
          : ["Ainda não há alertas recorrentes nas avaliações."],
    })),
    visaoGeral:
      "A comparação considera as notas e os relatos publicados por ex-moradores.",
    recomendacao:
      highestRated && highestRated.mediaGeral > 0
        ? `${highestRated.nome} tem a maior média entre os imóveis selecionados.`
        : "Ainda faltam avaliações para indicar uma opção com mais segurança.",
    geradoPorIa: false,
  };

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.json(CompareImoveisResponse.parse(fallback));
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 8192,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Você compara imóveis de aluguel no Brasil. Use somente os dados enviados. Seja objetivo, acolhedor e não invente fatos. Responda em JSON com visaoGeral, recomendacao e imoveis, onde cada imóvel tem id, pontosPositivos e pontosNegativos (até 3 itens curtos por lista).",
        },
        {
          role: "user",
          content: JSON.stringify(base),
        },
      ],
    });
    const content = completion.choices[0]?.message.content;
    const ai = content ? (JSON.parse(content) as AiResult) : {};
    const result = {
      imoveis: base.map((imovel) => {
        const aiImovel = ai.imoveis?.find((item) => Number(item.id) === imovel.id);
        return {
          ...imovel,
          pontosPositivos:
            strings(aiImovel?.pontosPositivos).length > 0
              ? strings(aiImovel?.pontosPositivos)
              : fallback.imoveis.find((item) => item.id === imovel.id)!.pontosPositivos,
          pontosNegativos:
            strings(aiImovel?.pontosNegativos).length > 0
              ? strings(aiImovel?.pontosNegativos)
              : fallback.imoveis.find((item) => item.id === imovel.id)!.pontosNegativos,
        };
      }),
      visaoGeral:
        typeof ai.visaoGeral === "string" && ai.visaoGeral.trim()
          ? ai.visaoGeral.trim()
          : fallback.visaoGeral,
      recomendacao:
        typeof ai.recomendacao === "string" && ai.recomendacao.trim()
          ? ai.recomendacao.trim()
          : fallback.recomendacao,
      geradoPorIa: true,
    };
    res.json(CompareImoveisResponse.parse(result));
  } catch (error) {
    req.log.warn({ err: error }, "Falha ao gerar comparação com OpenAI");
    res.json(CompareImoveisResponse.parse(fallback));
  }
});

export default router;