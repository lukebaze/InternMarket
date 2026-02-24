import { agents, ratings } from "@repo/db";
import { eq, and, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Db = NodePgDatabase<any>;

/** Get existing rating for this userId + agent pair */
export async function getExistingRating(db: Db, agentId: string, userId: string) {
  const rows = await db
    .select()
    .from(ratings)
    .where(and(eq(ratings.agentId, agentId), eq(ratings.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

/** Upsert rating + recalculate agent ratingAvg atomically */
export async function submitRating(
  db: Db,
  params: { agentId: string; userId: string; score: number; review?: string },
) {
  const { agentId, userId, score, review } = params;

  const [rating] = await db
    .insert(ratings)
    .values({ agentId, userId, score, review: review ?? null })
    .onConflictDoUpdate({
      target: [ratings.agentId, ratings.userId],
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
      userId: truncateId(r.userId),
      createdAt: r.createdAt.toISOString(),
    })),
    total: Number(countResult?.count ?? 0),
  };
}

/** Truncate UUID for privacy: first 8 chars */
function truncateId(id: string): string {
  return id.slice(0, 8) + "...";
}
