import { randomBytes } from "node:crypto";
import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, sessoesTable, usuariosTable } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
  RegisterResponse,
  LoginResponse,
  GetMeResponse,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router: IRouter = Router();

const SESSION_DAYS = 90;

async function createSession(userId: number): Promise<string> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessoesTable).values({ token, userId, expiresAt });
  return token;
}

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [existing] = await db
    .select({ id: usuariosTable.id })
    .from(usuariosTable)
    .where(eq(usuariosTable.email, email));
  if (existing) {
    res.status(409).json({ error: "E-mail já cadastrado" });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const [user] = await db
    .insert(usuariosTable)
    .values({ name: parsed.data.name.trim(), email, passwordHash })
    .returning();
  if (!user) {
    res.status(500).json({ error: "Erro ao criar usuário" });
    return;
  }
  const token = await createSession(user.id);
  res.status(201).json(
    RegisterResponse.parse({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    }),
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const email = parsed.data.email.trim().toLowerCase();
  const [user] = await db
    .select()
    .from(usuariosTable)
    .where(eq(usuariosTable.email, email));
  if (!user || !(await bcrypt.compare(parsed.data.password, user.passwordHash))) {
    res.status(401).json({ error: "E-mail ou senha incorretos" });
    return;
  }
  const token = await createSession(user.id);
  res.json(
    LoginResponse.parse({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    }),
  );
});

router.get("/auth/me", requireAuth, async (req, res): Promise<void> => {
  const user = req.currentUser!;
  res.json(
    GetMeResponse.parse({ id: user.id, name: user.name, email: user.email }),
  );
});

router.post("/auth/logout", requireAuth, async (req, res): Promise<void> => {
  if (req.sessionToken) {
    await db
      .delete(sessoesTable)
      .where(eq(sessoesTable.token, req.sessionToken));
  }
  res.sendStatus(204);
});

export default router;
