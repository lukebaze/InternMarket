import { pgTable, text, uuid, integer, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const agentVersions = pgTable(
  "agent_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    version: text("version").notNull(),
    packageUrl: text("package_url").notNull(),
    packageSize: integer("package_size").notNull(),
    sha256Hash: text("sha256_hash").notNull(),
    changelog: text("changelog"),
    downloads: integer("downloads").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("agent_versions_agent_version_unique").on(table.agentId, table.version),
  ]
);

export type AgentVersion = typeof agentVersions.$inferSelect;
export type NewAgentVersion = typeof agentVersions.$inferInsert;
