import OpenAI from "openai";
import { Router, type IRouter } from "express";
import { db, imoveisTable } from "@workspace/db";
import {
  ChatComAssistenteBody,
  ChatComAssistenteResponse,
} from "@workspace/api-zod";
import { ensureDemoData, loadAvaliacoes } from "./imoveis";

const router: IRouter = Router();

router.post("/assistente/chat", async (req, res): Promise<void> => {
  const body = ChatComAssistenteBody.safeParse(req.body);
  if (!body.success || body.data.messages.at(-1)?.role !== "user") {
    res.status(400).json({ error: "Envie uma pergunta válida para o assistente." });
    return;
  }

  await ensureDemoData();
  const [imoveis, avaliacoes] = await Promise.all([
    db.select().from(imoveisTable),
    loadAvaliacoes(),
  ]);
  const contexto = imoveis.map((imovel) => ({
    id: imovel.id,
    nome: imovel.nome,
    endereco: imovel.endereco,
    bairro: imovel.bairro,
    cidade: imovel.cidade,
    avaliacoes: avaliacoes
      .filter((row) => row.avaliacao.imovelId === imovel.id)
      .map((row) => ({
        notas: row.avaliacao.notas,
        relato: row.avaliacao.oQueGostariaDeSaber,
      })),
  }));

  const fallback = {
    resposta:
      "Não consegui consultar o assistente agora. Você ainda pode abrir os imóveis e conferir diretamente as notas e os relatos dos ex-moradores.",
    geradoPorIa: false,
  };
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.json(ChatComAssistenteResponse.parse(fallback));
    return;
  }

  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      max_completion_tokens: 4096,
      messages: [
        {
          role: "system",
          content: `Você é o assistente da Vizinhança Real, um app brasileiro de avaliações de imóveis para aluguel. Responda em português brasileiro, com clareza e acolhimento. Use somente os dados do catálogo abaixo ao falar de imóveis específicos e diga quando uma informação não estiver disponível. Ajude a interpretar avaliações, comparar opções e preparar perguntas para proprietário ou imobiliária. Não invente fatos, não dê aconselhamento jurídico definitivo e não exponha dados pessoais. Prefira respostas curtas, com no máximo 3 parágrafos ou uma lista breve.\n\nCATÁLOGO E AVALIAÇÕES:\n${JSON.stringify(contexto)}`,
        },
        ...body.data.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });
    const resposta = completion.choices[0]?.message.content?.trim();
    if (!resposta) throw new Error("OpenAI retornou uma resposta vazia");

    res.json(
      ChatComAssistenteResponse.parse({
        resposta,
        geradoPorIa: true,
      }),
    );
  } catch (error) {
    req.log.warn({ err: error }, "Falha ao responder pelo assistente");
    res.json(ChatComAssistenteResponse.parse(fallback));
  }
});

export default router;