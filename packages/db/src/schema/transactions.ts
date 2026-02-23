import { pgTable, text, uuid, decimal, timestamp, index } from "drizzle-orm/pg-core";
import { agents } from "./agents";

export const transactions = pgTable(
  "transactions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    agentId: uuid("agent_id")
      .references(() => agents.id)
      .notNull(),
    consumerWallet: text("consumer_wallet").notNull(),
    amount: decimal("amount", { precision: 18, scale: 6 }).notNull(),
    platformFee: decimal("platform_fee", { precision: 18, scale: 6 }).notNull(),
    creatorPayout: decimal("creator_payout", { precision: 18, scale: 6 }).notNull(),
    x402PaymentHash: text("x402_payment_hash"),
    status: text("status").notNull().default("pending"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("transactions_agent_id_idx").on(table.agentId)]
);

export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
