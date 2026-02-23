import { pgTable, text, uuid, integer, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    userWallet: text("user_wallet").notNull(),
    score: integer("score").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("ratings_agent_id_idx").on(table.agentId)]
);

export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
