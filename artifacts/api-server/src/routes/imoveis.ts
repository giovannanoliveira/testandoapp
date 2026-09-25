import { Router, type IRouter } from "express";
import { asc, desc, eq } from "drizzle-orm";
import { hash } from "bcryptjs";
import { randomBytes } from "node:crypto";
import {
  db,
  avaliacoesTable,
  imoveisTable,
  usuariosTable,
  type Imovel,
} from "@workspace/db";
import {
  GetImovelParams,
  GetImovelResponse,
  ListImoveisResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
let demoSeedPromise: Promise<void> | null = null;

type AvaliacaoRow = {
  avaliacao: typeof avaliacoesTable.$inferSelect;
  userName: string;
};

function serializeAvaliacao(row: AvaliacaoRow) {
  const { avaliacao, userName } = row;
  return {
    id: avaliacao.id,
    imovelId: avaliacao.imovelId,
    userId: avaliacao.userId,
    userName,
    data: avaliacao.createdAt,
    notas: avaliacao.notas,
    oQueGostariaDeSaber: avaliacao.oQueGostariaDeSaber,
  };
}

async function loadAvaliacoes(imovelId?: number): Promise<AvaliacaoRow[]> {
  const base = db
    .select({ avaliacao: avaliacoesTable, userName: usuariosTable.name })
    .from(avaliacoesTable)
    .innerJoin(usuariosTable, eq(avaliacoesTable.userId, usuariosTable.id))
    .orderBy(desc(avaliacoesTable.createdAt));
  if (imovelId !== undefined) {
    return base.where(eq(avaliacoesTable.imovelId, imovelId));
  }
  return base;
}

function serializeImovel(imovel: Imovel, avaliacoes: AvaliacaoRow[]) {
  return {
    id: imovel.id,
    nome: imovel.nome,
    endereco: imovel.endereco,
    bairro: imovel.bairro,
    cidade: imovel.cidade,
    avaliacoes: avaliacoes
      .filter((r) => r.avaliacao.imovelId === imovel.id)
      .map(serializeAvaliacao),
  };
}

async function ensureDemoData(): Promise<void> {
  if (demoSeedPromise) return demoSeedPromise;

  demoSeedPromise = (async () => {
    const existing = await db.select({ id: imoveisTable.id }).from(imoveisTable).limit(1);
    if (existing.length > 0) return;

    await db.transaction(async (tx) => {
      const passwordHash = await hash(randomBytes(32).toString("hex"), 10);
      const [demoUser] = await tx
        .insert(usuariosTable)
        .values({
          name: "Comunidade Vizinhança Real",
          email: "comunidade@demo.vizinhanca-real.local",
          passwordHash,
        })
        .returning();

      const properties = await tx
        .insert(imoveisTable)
        .values([
          {
            nome: "Edifício Solar das Palmeiras",
            endereco: "Rua Aspicuelta, 234",
            bairro: "Vila Madalena",
            cidade: "São Paulo",
          },
          {
            nome: "Condomínio Jardins da Serra",
            endereco: "Alameda Franca, 852",
            bairro: "Jardins",
            cidade: "São Paulo",
          },
          {
            nome: "Residencial Pinheiros Park",
            endereco: "Rua dos Pinheiros, 407",
            bairro: "Pinheiros",
            cidade: "São Paulo",
          },
          {
            nome: "Edifício Moema Living",
            endereco: "Avenida Ibirapuera, 2100",
            bairro: "Moema",
            cidade: "São Paulo",
          },
        ])
        .returning();

      await tx.insert(avaliacoesTable).values([
        {
          imovelId: properties[0].id,
          userId: demoUser.id,
          notas: {
            apartamento: { nota: 4, comentario: "Bem iluminado e com bons armários." },
            condominio: { nota: 2, comentario: "O elevador teve falhas recorrentes." },
            proprietario: { nota: 5, comentario: "Proprietário atencioso e rápido." },
            imobiliaria: { nota: 3, comentario: "Processos um pouco demorados." },
          },
          oQueGostariaDeSaber:
            "Vale conferir o histórico recente de manutenção do elevador antes de fechar.",
        },
        {
          imovelId: properties[1].id,
          userId: demoUser.id,
          notas: {
            apartamento: { nota: 5, comentario: "Espaço excelente e bem conservado." },
            condominio: { nota: 5, comentario: "Portaria e áreas comuns muito cuidadas." },
            proprietario: { nota: 4, comentario: "Comunicação profissional e direta." },
            imobiliaria: { nota: 2, comentario: "Vistoria de saída bastante lenta." },
          },
          oQueGostariaDeSaber:
            "A vistoria pode atrasar a devolução da caução; documente tudo por escrito.",
        },
        {
          imovelId: properties[2].id,
          userId: demoUser.id,
          notas: {
            apartamento: { nota: 2, comentario: "Havia infiltração em uma parede do quarto." },
            condominio: { nota: 4, comentario: "Academia e coworking são muito bons." },
            proprietario: { nota: 1, comentario: "Demorou meses para resolver a infiltração." },
            imobiliaria: { nota: 4, comentario: "Processo de entrada foi tranquilo." },
          },
          oQueGostariaDeSaber:
            "Observe manchas de umidade e pergunte sobre reparos anteriores antes de alugar.",
        },
        {
          imovelId: properties[3].id,
          userId: demoUser.id,
          notas: {
            apartamento: { nota: 5, comentario: "Vista bonita e acabamento muito bem cuidado." },
            condominio: { nota: 5, comentario: "Portaria moderna e academia renovada." },
            proprietario: { nota: 5, comentario: "Sempre respondeu no mesmo dia." },
            imobiliaria: { nota: 4, comentario: "Atendimento organizado." },
          },
          oQueGostariaDeSaber:
            "A vaga tem uma coluna lateral; carros grandes devem conferir o espaço.",
        },
      ]);
    });
  })().catch((error) => {
    demoSeedPromise = null;
    throw error;
  });

  return demoSeedPromise;
}

router.get("/imoveis", async (_req, res): Promise<void> => {
  await ensureDemoData();
  const [imoveis, avaliacoes] = await Promise.all([
    db.select().from(imoveisTable).orderBy(asc(imoveisTable.id)),
    loadAvaliacoes(),
  ]);
  res.json(
    ListImoveisResponse.parse(
      imoveis.map((i) => serializeImovel(i, avaliacoes)),
    ),
  );
});

router.get("/imoveis/:id", async (req, res): Promise<void> => {
  await ensureDemoData();
  const params = GetImovelParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [imovel] = await db
    .select()
    .from(imoveisTable)
    .where(eq(imoveisTable.id, params.data.id));
  if (!imovel) {
    res.status(404).json({ error: "Imóvel não encontrado" });
    return;
  }
  const avaliacoes = await loadAvaliacoes(imovel.id);
  res.json(GetImovelResponse.parse(serializeImovel(imovel, avaliacoes)));
});

export { serializeAvaliacao, loadAvaliacoes, ensureDemoData };
export default router;
