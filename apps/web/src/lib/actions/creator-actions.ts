"use server";

import type { Agent, Creator } from "@repo/types";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { creators, agents } from "@repo/db";
import { eq, avg, sum } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/**
 * Ensures a creator row exists for the given wallet address.
 * Returns the creator ID (existing or newly inserted).
 */
export async function ensureCreator(walletAddress: string): Promise<string> {
  const db = getDb();

  const existing = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.walletAddress, walletAddress))
    .limit(1);

  if (existing.length) return existing[0].id;

  const inserted = await db
    .insert(creators)
    .values({ walletAddress })
    .returning({ id: creators.id });

  return inserted[0].id;
}

/**
 * Called from dashboard layout to auto-create creator on first visit.
 * Uses session to get wallet address — never accepts client-submitted data.
 */
export async function ensureCreatorOnLogin(): Promise<string | null> {
  try {
    const session = await auth();
    if (!session?.user) return null;

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) return null;

    return await ensureCreator(walletAddress);
  } catch {
    return null;
  }
}

export interface CreatorProfile {
  creator: Creator;
  agents: Agent[];
  aggregates: { totalCalls: number; avgTrustScore: number; totalAgents: number };
}

/** Fetch public creator profile by wallet address */
export async function getCreatorProfile(wallet: string): Promise<CreatorProfile | null> {
  try {
    const db = getDb();

    const creatorRows = await db
      .select()
      .from(creators)
      .where(eq(creators.walletAddress, wallet))
      .limit(1);

    if (!creatorRows.length) return null;

    const creator = creatorRows[0] as unknown as Creator;

    const creatorAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.creatorId, creator.id));

    const agentList = creatorAgents as unknown as Agent[];

    const [agg] = await db
      .select({
        totalCalls: sum(agents.totalCalls),
        avgTrust: avg(agents.trustScore),
      })
      .from(agents)
      .where(eq(agents.creatorId, creator.id));

    return {
      creator,
      agents: agentList,
      aggregates: {
        totalCalls: Number(agg?.totalCalls ?? 0),
        avgTrustScore: parseFloat(agg?.avgTrust ?? "0"),
        totalAgents: agentList.length,
      },
    };
  } catch {
    return null;
  }
}
