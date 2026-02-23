"use server";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { ratings, agents } from "@repo/db";
import { eq, and, sql, gte } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/**
 * Wilson lower bound for rating average — prevents gaming with few ratings.
 * Returns the lower bound of a 95% confidence interval.
 * Only applies when 5+ ratings exist; below that uses simple average.
 */
function wilsonLowerBound(positive: number, total: number, z = 1.96): number {
  if (total === 0) return 0;
  if (total < 5) return positive / total;

  const phat = positive / total;
  const denominator = 1 + (z * z) / total;
  const center = phat + (z * z) / (2 * total);
  const spread = z * Math.sqrt((phat * (1 - phat) + (z * z) / (4 * total)) / total);

  return (center - spread) / denominator;
}

export async function submitRating(agentId: string, score: number, review?: string) {
  const session = await auth();
  if (!(session?.user as { address?: string })?.address) {
    throw new Error("Not authenticated");
  }
  const userWallet = (session!.user as { address: string }).address;

  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    throw new Error("Score must be an integer between 1 and 5");
  }

  const db = getDb();

  // Check if already rated this agent
  const existing = await db.query.ratings.findFirst({
    where: and(eq(ratings.agentId, agentId), eq(ratings.userWallet, userWallet)),
  });
  if (existing) throw new Error("You have already rated this agent");

  // 24h cooldown: check if wallet has rated ANY agent in last 24 hours
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentRating = await db.query.ratings.findFirst({
    where: and(eq(ratings.userWallet, userWallet), gte(ratings.createdAt, oneDayAgo)),
  });
  if (recentRating) throw new Error("Please wait 24 hours between ratings");

  // Insert rating
  await db.insert(ratings).values({
    agentId,
    userWallet,
    score,
    review: review?.trim() || null,
  });

  // Update agent rating average using Wilson lower bound
  // Treat scores >= 4 as "positive" for Wilson calculation, normalize to 0-5 scale
  const allRatings = await db
    .select({
      total: sql<number>`COUNT(*)`,
      positive: sql<number>`COUNT(*) FILTER (WHERE score >= 4)`,
      simpleAvg: sql<number>`AVG(score::numeric)`,
    })
    .from(ratings)
    .where(eq(ratings.agentId, agentId));

  const stats = allRatings[0];
  const total = Number(stats?.total ?? 0);
  const positive = Number(stats?.positive ?? 0);
  const simpleAvg = Number(stats?.simpleAvg ?? 0);

  // Wilson gives 0-1 confidence for "positive" ratio, scale to 0-5
  const wilsonScore = total >= 5
    ? wilsonLowerBound(positive, total) * 5
    : simpleAvg;

  await db
    .update(agents)
    .set({ ratingAvg: wilsonScore.toFixed(2) })
    .where(eq(agents.id, agentId));
}

export async function getAgentRatings(agentId: string) {
  const db = getDb();
  return db.query.ratings.findMany({
    where: eq(ratings.agentId, agentId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    limit: 20,
  });
}
