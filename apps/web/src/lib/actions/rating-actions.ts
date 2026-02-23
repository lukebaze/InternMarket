"use server";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { ratings, agents } from "@repo/db";
import { eq, and, sql } from "drizzle-orm";

export async function submitRating(agentId: string, score: number, review?: string) {
  const session = await auth();
  if (!(session?.user as { address?: string })?.address) {
    throw new Error("Not authenticated");
  }
  const userWallet = (session!.user as { address: string }).address;

  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    throw new Error("Score must be an integer between 1 and 5");
  }

  const db = createNodeClient(process.env.DATABASE_URL!);

  // Check if already rated
  const existing = await db.query.ratings.findFirst({
    where: and(eq(ratings.agentId, agentId), eq(ratings.userWallet, userWallet)),
  });
  if (existing) throw new Error("You have already rated this agent");

  // Insert rating
  await db.insert(ratings).values({
    agentId,
    userWallet,
    score,
    review: review?.trim() || null,
  });

  // Update agent rating average
  await db
    .update(agents)
    .set({
      ratingAvg: sql`(SELECT COALESCE(AVG(score::numeric), 0) FROM ratings WHERE agent_id = ${agentId})`,
    })
    .where(eq(agents.id, agentId));
}

export async function getAgentRatings(agentId: string) {
  const db = createNodeClient(process.env.DATABASE_URL!);
  return db.query.ratings.findMany({
    where: eq(ratings.agentId, agentId),
    orderBy: (r, { desc }) => [desc(r.createdAt)],
    limit: 20,
  });
}
