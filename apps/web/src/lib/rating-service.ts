import { agents, ratings, transactions } from "@repo/db";
import { eq, and, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = NodePgDatabase<any>;

/** Check if wallet has at least one completed transaction with this agent */
export async function checkRatingEligibility(
  db: Db,
  agentId: string,
  wallet: string,
): Promise<{ eligible: boolean; reason?: string }> {
  const txRows = await db
    .select({ id: transactions.id })
    .from(transactions)
    .where(
      and(
        eq(transactions.agentId, agentId),
        eq(transactions.consumerWallet, wallet),
        eq(transactions.status, "completed"),
      ),
    )
    .limit(1);

  if (!txRows.length) {
    return { eligible: false, reason: "Must complete a transaction before rating" };
  }
  return { eligible: true };
}

/** Get existing rating for this wallet + agent pair */
export async function getExistingRating(db: Db, agentId: string, wallet: string) {
  const rows = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.agentId, agentId), eq(ratings.userWallet, wallet)))
    .limit(1);
  return rows[0] ?? null;
}

/** Upsert rating + recalculate agent ratingAvg atomically */
export async function submitRating(
  db: Db,
  params: { agentId: string; userWallet: string; score: number; review?: string },
) {
  const { agentId, userWallet, score, review } = params;

  // Upsert: insert or update on conflict (agent_id, user_wallet)
  const [rating] = await db
    .insert(ratings)
    .values({ agentId, userWallet, score, review: review ?? null })
    .onConflictDoUpdate({
      target: [ratings.agentId, ratings.userWallet],
      set: { score, review: review ?? null, createdAt: new Date() },
    })
    .returning();

  // Recalculate ratingAvg and ratingCount from all ratings for this agent
  const [agg] = await db
    .select({
      avg: sql<string>`ROUND(AVG(${ratings.score})::numeric, 2)`,
      count: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .where(eq(ratings.agentId, agentId));

  await db
    .update(agents)
    .set({
      ratingAvg: agg?.avg ?? "0",
      ratingCount: Number(agg?.count ?? 0),
    })
    .where(eq(agents.id, agentId));

  return rating;
}

/** List ratings for an agent with pagination */
export async function listAgentRatings(
  db: Db,
  agentId: string,
  limit: number,
  offset: number,
) {
  const rows = await db
    .select()
    .from(ratings)
    .where(eq(ratings.agentId, agentId))
    .orderBy(sql`${ratings.createdAt} DESC`)
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(ratings)
    .where(eq(ratings.agentId, agentId));

  return {
    ratings: rows.map((r) => ({
      id: r.id,
      score: r.score,
      review: r.review,
      userWallet: truncateWallet(r.userWallet),
      createdAt: r.createdAt.toISOString(),
    })),
    total: Number(countResult?.count ?? 0),
  };
}

/** Truncate wallet for privacy: 0x1234...abcd */
function truncateWallet(wallet: string): string {
  if (wallet.length <= 10) return wallet;
  return `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;
}
