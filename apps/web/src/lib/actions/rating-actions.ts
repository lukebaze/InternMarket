"use server";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import {
  checkRatingEligibility,
  submitRating as submitRatingService,
  listAgentRatings,
} from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/**
 * Server action: submit or update a rating.
 * Delegates to rating-service for canonical business logic:
 * - Requires completed transaction (anti-sybil)
 * - Upsert pattern (one rating per wallet per agent, updatable)
 * - Atomic ratingAvg + ratingCount recalculation
 */
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

  const { eligible, reason } = await checkRatingEligibility(db, agentId, userWallet);
  if (!eligible) throw new Error(reason ?? "Not eligible to rate");

  await submitRatingService(db, {
    agentId,
    userWallet,
    score,
    review: review?.trim() || undefined,
  });
}

export async function getAgentRatings(agentId: string) {
  const db = getDb();
  const result = await listAgentRatings(db, agentId, 20, 0);
  return result.ratings;
}
