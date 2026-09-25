import type { NextFunction, Request, Response } from "express";
import { and, eq, gt } from "drizzle-orm";
import { clerkClient, getAuth } from "@clerk/express";
import { randomBytes } from "node:crypto";
import { hash } from "bcryptjs";
import { db, sessoesTable, usuariosTable, type Usuario } from "@workspace/db";

declare global {
  namespace Express {
    interface Request {
      currentUser?: Usuario;
      sessionToken?: string;
    }
  }
}

export function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  return token.length > 0 ? token : null;
}

export async function loadUserFromToken(
  token: string,
): Promise<Usuario | null> {
  const [row] = await db
    .select({ user: usuariosTable })
    .from(sessoesTable)
    .innerJoin(usuariosTable, eq(sessoesTable.userId, usuariosTable.id))
    .where(
      and(eq(sessoesTable.token, token), gt(sessoesTable.expiresAt, new Date())),
    );
  return row?.user ?? null;
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const clerkAuth = getAuth(req);
  if (clerkAuth.userId) {
    let [user] = await db
      .select()
      .from(usuariosTable)
      .where(eq(usuariosTable.clerkUserId, clerkAuth.userId));

    if (!user) {
      const clerkUser = await clerkClient.users.getUser(clerkAuth.userId);
      const email =
        clerkUser.emailAddresses.find(
          (item) => item.id === clerkUser.primaryEmailAddressId,
        )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress;
      if (!email) {
        res.status(401).json({ error: "A conta Google não possui um e-mail válido" });
        return;
      }
      const normalizedEmail = email.trim().toLowerCase();
      const [existing] = await db
        .select()
        .from(usuariosTable)
        .where(eq(usuariosTable.email, normalizedEmail));
      const name =
        [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
        normalizedEmail.split("@")[0];

      if (existing) {
        [user] = await db
          .update(usuariosTable)
          .set({ clerkUserId: clerkAuth.userId, name })
          .where(eq(usuariosTable.id, existing.id))
          .returning();
      } else {
        [user] = await db
          .insert(usuariosTable)
          .values({
            clerkUserId: clerkAuth.userId,
            name,
            email: normalizedEmail,
            passwordHash: await hash(randomBytes(32).toString("hex"), 10),
          })
          .returning();
      }
    }

    req.currentUser = user;
    next();
    return;
  }

  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ error: "Não autenticado" });
    return;
  }
  const user = await loadUserFromToken(token);
  if (!user) {
    res.status(401).json({ error: "Sessão inválida ou expirada" });
    return;
  }
  req.currentUser = user;
  req.sessionToken = token;
  next();
}
