import { pgTable, text, uuid, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents";
import { agentVersions } from "./agent-versions";

export const downloads = pgTable(
  "downloads",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    versionId: uuid("version_id")
      .references(() => agentVersions.id),
    userId: uuid("user_id"),
    ipHash: text("ip_hash").notNull(),
    version: text("version").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("downloads_agent_created_idx").on(table.agentId, table.createdAt),
  ]
);

export type Download = typeof downloads.$inferSelect;
export type NewDownload = typeof downloads.$inferInsert;
