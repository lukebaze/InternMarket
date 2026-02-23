import { transactions, agents, creators } from "@repo/db";
import { eq, sql } from "drizzle-orm";
import type { GatewayDb } from "../lib/db";

interface LogTransactionParams {
  agentId: string;
  consumerWallet: string;
  amount: string;
  platformFee: string;
  creatorPayout: string;
  paymentHash: string;
}

// Insert transaction record and update agent/creator aggregate counters
export async function logTransaction(db: GatewayDb, params: LogTransactionParams) {
  const [txn] = await db.insert(transactions).values({
    agentId: params.agentId,
    consumerWallet: params.consumerWallet,
    amount: params.amount,
    platformFee: params.platformFee,
    creatorPayout: params.creatorPayout,
    x402PaymentHash: params.paymentHash,
    status: "completed",
  }).returning();

  // Increment agent total_calls counter
  await db.update(agents)
    .set({ totalCalls: sql`${agents.totalCalls} + 1` })
    .where(eq(agents.id, params.agentId));

  // Add creator payout to total_revenue — subquery finds the creator from the agent
  await db.update(creators)
    .set({ totalRevenue: sql`${creators.totalRevenue} + ${params.creatorPayout}` })
    .where(
      eq(
        creators.id,
        sql`(SELECT creator_id FROM agents WHERE id = ${params.agentId})`
      )
    );

  return txn;
}
