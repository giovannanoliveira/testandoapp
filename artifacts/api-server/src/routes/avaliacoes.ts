import { Router, type IRouter } from "express";
import { db, avaliacoesTable } from "@workspace/db";
import {
  CreateAvaliacaoBody,
  CreateAvaliacaoResponse,
  ListAvaliacoesQueryParams,
  ListAvaliacoesResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";
import { loadAvaliacoes, serializeAvaliacao } from "./imoveis";

const router: IRouter = Router();

router.get("/avaliacoes", async (req, res): Promise<void> => {
  const query = ListAvaliacoesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = await loadAvaliacoes(query.data.imovelId);
  res.json(ListAvaliacoesResponse.parse(rows.map(serializeAvaliacao)));
});

router.post("/avaliacoes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateAvaliacaoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const notas = parsed.data.notas;
  const hasNota = Object.values(notas).some((n) => n && n.nota >= 1);
  if (!hasNota) {
    res.status(400).json({ error: "Informe ao menos uma nota" });
    return;
  }
  const user = req.currentUser!;
  const [avaliacao] = await db
    .insert(avaliacoesTable)
    .values({
      imovelId: parsed.data.imovelId,
      userId: user.id,
      notas,
      oQueGostariaDeSaber: parsed.data.oQueGostariaDeSaber.trim(),
    })
    .returning();
  if (!avaliacao) {
    res.status(500).json({ error: "Erro ao salvar avaliação" });
    return;
  }
  res.status(201).json(
    CreateAvaliacaoResponse.parse(
      serializeAvaliacao({ avaliacao, userName: user.name }),
    ),
  );
});

export default router;
