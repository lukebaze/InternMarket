import { pgTable, uuid, integer, text, timestamp, index, uniqueIndex } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const ratings = pgTable(
  "ratings",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id").notNull(),
    score: integer("score").notNull(),
    review: text("review"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("ratings_agent_id_idx").on(table.agentId),
    uniqueIndex("ratings_agent_user_unique").on(table.agentId, table.userId),
  ]
);

export type Rating = typeof ratings.$inferSelect;
export type NewRating = typeof ratings.$inferInsert;
