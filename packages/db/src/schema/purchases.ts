import { pgTable, uuid, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const purchases = pgTable("purchases", {
  id: uuid("id").primaryKey().defaultRandom(),
  agentId: uuid("agent_id")
    .references(() => agents.id)
    .notNull(),
  buyerClerkId: text("buyer_clerk_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: numeric("amount", { precision: 10, scale: 2 }),
  platformFee: numeric("platform_fee", { precision: 10, scale: 2 }),
  creatorPayout: numeric("creator_payout", { precision: 10, scale: 2 }),
  pricingModel: text("pricing_model"),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Purchase = typeof purchases.$inferSelect;
export type NewPurchase = typeof purchases.$inferInsert;
