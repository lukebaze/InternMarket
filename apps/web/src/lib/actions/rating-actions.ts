"use server";

import { auth } from "@clerk/nextjs/server";
import { createNodeClient, agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import { submitRating as submitRatingService, listAgentRatings } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/**
 * Server action: submit or update a rating.
 * Upsert pattern — one rating per userId per agent, updatable.
 * Atomically recalculates ratingAvg + ratingCount.
 */
export async function submitRating(agentId: string, score: number, review?: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  if (score < 1 || score > 5 || !Number.isInteger(score)) {
    throw new Error("Score must be an integer between 1 and 5");
  }

  const db = getDb();

  // Look up creator by clerkUserId
  const [creator] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.clerkUserId, userId))
    .limit(1);

  if (!creator) throw new Error("Creator profile not found. Visit dashboard first.");

  await submitRatingService(db, {
    agentId,
    userId: creator.id,
    score,
    review: review?.trim() || undefined,
  });
}

export async function getAgentRatings(agentId: string) {
  const db = getDb();
  const result = await listAgentRatings(db, agentId, 20, 0);
  return result.ratings;
}
