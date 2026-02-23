import { pgTable, text, uuid, integer, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const agentShowcase = pgTable(
  "agent_showcase",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    inputExample: text("input_example").notNull(),
    outputExample: text("output_example").notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("agent_showcase_agent_id_idx").on(table.agentId)]
);

export type AgentShowcase = typeof agentShowcase.$inferSelect;
export type NewAgentShowcase = typeof agentShowcase.$inferInsert;
