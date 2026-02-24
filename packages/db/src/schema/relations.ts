import { relations } from "drizzle-orm";
import { creators } from "./creators";
import { agents } from "./agents";
import { agentVersions } from "./agent-versions";
import { downloads } from "./downloads";
import { ratings } from "./ratings";
import { purchases } from "./purchases";

export const creatorsRelations = relations(creators, ({ many }) => ({
  agents: many(agents),
}));

export const agentsRelations = relations(agents, ({ one, many }) => ({
  creator: one(creators, {
    fields: [agents.creatorId],
    references: [creators.id],
  }),
  versions: many(agentVersions),
  downloads: many(downloads),
  ratings: many(ratings),
  purchases: many(purchases),
}));

export const purchasesRelations = relations(purchases, ({ one }) => ({
  agent: one(agents, {
    fields: [purchases.agentId],
    references: [agents.id],
  }),
}));

export const agentVersionsRelations = relations(agentVersions, ({ one }) => ({
  agent: one(agents, {
    fields: [agentVersions.agentId],
    references: [agents.id],
  }),
}));

export const downloadsRelations = relations(downloads, ({ one }) => ({
  agent: one(agents, {
    fields: [downloads.agentId],
    references: [agents.id],
  }),
  version: one(agentVersions, {
    fields: [downloads.versionId],
    references: [agentVersions.id],
  }),
}));

export const ratingsRelations = relations(ratings, ({ one }) => ({
  agent: one(agents, {
    fields: [ratings.agentId],
    references: [agents.id],
  }),
}));
