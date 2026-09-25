import {
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { imoveisTable } from "./imoveis";
import { usuariosTable } from "./usuarios";

export interface NotaCategoriaValue {
  nota: number;
  comentario?: string;
}

export type NotasValue = Partial<
  Record<
    "apartamento" | "condominio" | "proprietario" | "imobiliaria",
    NotaCategoriaValue
  >
>;

export const avaliacoesTable = pgTable("avaliacoes", {
  id: serial("id").primaryKey(),
  imovelId: integer("imovel_id")
    .notNull()
    .references(() => imoveisTable.id, { onDelete: "cascade" }),
  userId: integer("user_id")
    .notNull()
    .references(() => usuariosTable.id, { onDelete: "cascade" }),
  notas: jsonb("notas").$type<NotasValue>().notNull(),
  oQueGostariaDeSaber: text("o_que_gostaria_de_saber").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertAvaliacaoSchema = createInsertSchema(avaliacoesTable).omit({
  id: true,
  createdAt: true,
});
export type InsertAvaliacao = z.infer<typeof insertAvaliacaoSchema>;
export type Avaliacao = typeof avaliacoesTable.$inferSelect;
