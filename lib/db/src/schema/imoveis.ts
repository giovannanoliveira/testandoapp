import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const imoveisTable = pgTable("imoveis", {
  id: serial("id").primaryKey(),
  nome: text("nome").notNull(),
  endereco: text("endereco").notNull(),
  bairro: text("bairro").notNull(),
  cidade: text("cidade").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const insertImovelSchema = createInsertSchema(imoveisTable).omit({
  id: true,
  createdAt: true,
});
export type InsertImovel = z.infer<typeof insertImovelSchema>;
export type Imovel = typeof imoveisTable.$inferSelect;
