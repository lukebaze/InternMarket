"use server";

import { auth } from "@clerk/nextjs/server";
import { createNodeClient } from "@repo/db";
import { creators, agents } from "@repo/db";
import { eq, avg, sum } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/**
 * Ensures a creator row exists for the given Clerk userId.
 * Returns the creator ID (existing or newly inserted).
 */
export async function ensureCreator(clerkUserId: string): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.clerkUserId, clerkUserId))
    .limit(1);

  if (existing.length) return existing[0].id;

  const inserted = await db
    .insert(creators)
    .values({ clerkUserId })
    .returning({ id: creators.id });

  return inserted[0].id;
}

/**
 * Called from dashboard layout to auto-create creator on first visit.
 * Uses Clerk userId as identity — never accepts client-submitted data.
 */
export async function ensureCreatorOnLogin(): Promise<string | null> {
  try {
    const { userId } = await auth();
    if (!userId) return null;

    return await ensureCreator(userId);
  } catch {
    return null;
  }
}

export interface CreatorProfile {
  creator: typeof creators.$inferSelect;
  agents: (typeof agents.$inferSelect)[];
  aggregates: { totalDownloads: number; avgRating: number; totalAgents: number };
}

/** Fetch public creator profile by clerkUserId */
export async function getCreatorProfile(clerkUserId: string): Promise<CreatorProfile | null> {
  try {
    const db = getDb();

    const creatorRows = await db
      .select()
      .from(creators)
      .where(eq(creators.clerkUserId, clerkUserId))
      .limit(1);

    if (!creatorRows.length) return null;

    const creator = creatorRows[0];

    const creatorAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.creatorId, creator.id));

    const [agg] = await db
      .select({
        totalDownloads: sum(agents.downloads),
        avgRating: avg(agents.ratingAvg),
      })
      .from(agents)
      .where(eq(agents.creatorId, creator.id));

    return {
      creator,
      agents: creatorAgents,
      aggregates: {
        totalDownloads: Number(agg?.totalDownloads ?? 0),
        avgRating: parseFloat(String(agg?.avgRating ?? "0")),
        totalAgents: creatorAgents.length,
      },
    };
  } catch {
    return null;
  }
}
