"use server";

import type { Agent } from "@repo/types";
import { auth } from "@clerk/nextjs/server";
import { createNodeClient } from "@repo/db";
import { agents, creators, downloads } from "@repo/db";
import { eq, desc, count, avg, sum, sql } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

export async function getMyAgents(): Promise<Agent[]> {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const db = getDb();

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorRows.length) return [];

    const rows = await db
      .select()
      .from(agents)
      .where(eq(agents.creatorId, creatorRows[0].id))
      .orderBy(desc(agents.createdAt));

    return rows as unknown as Agent[];
  } catch {
    return [];
  }
}

export interface DashboardStats {
  totalAgents: number;
  totalDownloads: number;
  avgRating: string;
  totalRatings: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const { userId } = await auth();
    const emptyStats: DashboardStats = { totalAgents: 0, totalDownloads: 0, avgRating: "0", totalRatings: 0 };

    if (!userId) return emptyStats;

    const db = getDb();

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorRows.length) return emptyStats;

    const creatorId = creatorRows[0].id;

    const [stats] = await db
      .select({
        totalAgents: count(agents.id),
        totalDownloads: sum(agents.downloads),
        avgRating: avg(agents.ratingAvg),
        totalRatings: sql<number>`sum(${agents.ratingCount})`,
      })
      .from(agents)
      .where(eq(agents.creatorId, creatorId));

    return {
      totalAgents: Number(stats?.totalAgents ?? 0),
      totalDownloads: Number(stats?.totalDownloads ?? 0),
      avgRating: String(stats?.avgRating ?? "0"),
      totalRatings: Number(stats?.totalRatings ?? 0),
    };
  } catch {
    return { totalAgents: 0, totalDownloads: 0, avgRating: "0", totalRatings: 0 };
  }
}

export interface DownloadRecord {
  id: string;
  agentId: string;
  version: string;
  ipHash: string;
  createdAt: Date;
}

export interface PaginatedDownloads {
  downloads: DownloadRecord[];
  nextCursor?: string;
}

export async function getMyDownloads(
  params: { limit?: number } = {},
): Promise<PaginatedDownloads> {
  try {
    const { userId } = await auth();
    if (!userId) return { downloads: [] };

    const db = getDb();
    const { limit = 20 } = params;

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creatorRows.length) return { downloads: [] };

    const creatorAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.creatorId, creatorRows[0].id));

    if (!creatorAgents.length) return { downloads: [] };

    // Get recent downloads across all creator's agents
    const rows: DownloadRecord[] = [];
    for (const a of creatorAgents.slice(0, 5)) {
      const agentDownloads = await db
        .select()
        .from(downloads)
        .where(eq(downloads.agentId, a.id))
        .orderBy(desc(downloads.createdAt))
        .limit(limit);
      rows.push(...(agentDownloads as DownloadRecord[]));
    }

    rows.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const data = rows.slice(0, limit);
    const nextCursor = data.length >= limit ? data[data.length - 1].id : undefined;

    return { downloads: data, nextCursor };
  } catch {
    return { downloads: [] };
  }
}
