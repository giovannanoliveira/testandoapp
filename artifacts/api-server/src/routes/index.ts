import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import imoveisRouter from "./imoveis";
import avaliacoesRouter from "./avaliacoes";
import comparacoesRouter from "./comparacoes";
import assistenteRouter from "./assistente";
import stripeRouter from "./stripe";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(imoveisRouter);
router.use(avaliacoesRouter);
router.use(comparacoesRouter);
router.use(assistenteRouter);
router.use(stripeRouter);

export default router;
