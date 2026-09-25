import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { usuariosTable } from "./usuarios";

export const sessoesTable = pgTable("sessoes", {
  token: text("token").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => usuariosTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
});

export type Sessao = typeof sessoesTable.$inferSelect;
