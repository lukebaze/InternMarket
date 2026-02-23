import { pgTable, text, uuid, decimal, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { creators } from "./creators";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique().notNull(),
    creatorId: uuid("creator_id")
      .references(() => creators.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    mcpEndpoint: text("mcp_endpoint").notNull(),
    creatorWallet: text("creator_wallet").notNull(),
    pricePerCall: decimal("price_per_call", { precision: 10, scale: 6 }).notNull(),
    agentCard: jsonb("agent_card"),
    tools: jsonb("tools"),
    ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default("0"),
    totalCalls: integer("total_calls").default(0),
    status: text("status").notNull().default("active"),
    trustScore: decimal("trust_score", { precision: 5, scale: 2 }).default("0"),
    trustTier: text("trust_tier").default("new"),
    uptime30d: decimal("uptime_30d", { precision: 5, scale: 2 }).default("0"),
    successRate30d: decimal("success_rate_30d", { precision: 5, scale: 2 }).default("0"),
    p95LatencyMs: integer("p95_latency_ms").default(0),
    uniqueConsumers30d: integer("unique_consumers_30d").default(0),
    healthCheckFailures: integer("health_check_failures").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("agents_creator_id_idx").on(table.creatorId)]
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
