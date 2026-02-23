import { pgTable, uuid, integer, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const agentMetrics = pgTable(
  "agent_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id, { onDelete: "cascade" })
      .notNull(),
    timestamp: timestamp("timestamp").notNull(),
    totalRequests: integer("total_requests").default(0),
    successfulRequests: integer("successful_requests").default(0),
    failedRequests: integer("failed_requests").default(0),
    avgLatencyMs: integer("avg_latency_ms").default(0),
    p95LatencyMs: integer("p95_latency_ms").default(0),
    uniqueConsumers: integer("unique_consumers").default(0),
  },
  (table) => [index("agent_metrics_agent_id_idx").on(table.agentId)]
);

export type AgentMetric = typeof agentMetrics.$inferSelect;
export type NewAgentMetric = typeof agentMetrics.$inferInsert;
