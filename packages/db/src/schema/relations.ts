import { relations } from "drizzle-orm";
import { creators } from "./creators";
import { agents } from "./agents";
import { transactions } from "./transactions";
import { ratings } from "./ratings";
import { agentMetrics } from "./agent-metrics";
import { agentShowcase } from "./agent-showcase";

export const creatorsRelations = relations(creators, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(creators, {
    fields: [agents.creatorId],
    references: [creators.id],
  }),
  transactions: many(transactions),
  ratings: many(ratings),
  agentMetrics: many(agentMetrics),
  agentShowcase: many(agentShowcase),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  agent: one(agents, {
    fields: [transactions.agentId],
    references: [agents.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  agent: one(agents, {
    fields: [ratings.agentId],
    references: [agents.id],
  }),
}));

export const agentMetricsRelations = relations(agentMetrics, ({ one }) => ({
  agent: one(agents, {
    fields: [agentMetrics.agentId],
    references: [agents.id],
  }),
}));

export const agentShowcaseRelations = relations(agentShowcase, ({ one }) => ({
  agent: one(agents, {
    fields: [agentShowcase.agentId],
    references: [agents.id],
  }),
}));
