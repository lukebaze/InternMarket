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
  status?: "completed" | "failed" | "refunded";
}

// Insert transaction record and update agent/creator aggregate counters
export async function logTransaction(db: GatewayDb, params: LogTransactionParams) {
  const status = params.status ?? "completed";

  const txn = await withRetry(() =>
    db.insert(transactions).values({
      agentId: params.agentId,
      consumerWallet: params.consumerWallet,
      amount: params.amount,
      platformFee: params.platformFee,
      creatorPayout: params.creatorPayout,
      x402PaymentHash: params.paymentHash,
      status,
    }).returning(),
  );

  // Only increment counters for completed transactions
  if (status === "completed") {
    await withRetry(() =>
      db.update(agents)
        .set({ totalCalls: sql`${agents.totalCalls} + 1` })
        .where(eq(agents.id, params.agentId)),
    );

    await withRetry(() =>
      db.update(creators)
        .set({ totalRevenue: sql`${creators.totalRevenue} + ${params.creatorPayout}` })
        .where(
          eq(
            creators.id,
            sql`(SELECT creator_id FROM agents WHERE id = ${params.agentId})`,
          ),
        ),
    );
  }

  return txn?.[0] ?? null;
}

/** Log a refund transaction — upstream failed after payment verified */
export async function logRefundTransaction(
  db: GatewayDb,
  params: Omit<LogTransactionParams, "status">,
) {
  return logTransaction(db, { ...params, status: "refunded" });
}

/** Retry a DB operation once after 1s delay on failure */
async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    console.warn("[transaction-logger] DB write failed, retrying in 1s:", err);
    await new Promise((r) => setTimeout(r, 1_000));
    return fn();
  }
}
