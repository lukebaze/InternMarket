"use server";

import type { Agent, Transaction } from "@repo/types";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { agents, transactions, creators } from "@repo/db";
import { eq, desc, count, avg, sum, inArray } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

export async function getMyAgents(): Promise<Agent[]> {
  try {
    const session = await auth();
    if (!session?.user) return [];

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) return [];

    const db = getDb();
    const rows = await db
      .select()
      .from(agents)
      .where(eq(agents.creatorWallet, walletAddress))
      .orderBy(desc(agents.createdAt));

    return rows as unknown as Agent[];
  } catch {
    return [];
  }
}

export interface DashboardStats {
  totalAgents: number;
  totalCalls: number;
  totalRevenue: string;
  avgRating: string;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    const session = await auth();
    if (!session?.user) return { totalAgents: 0, totalCalls: 0, totalRevenue: "0", avgRating: "0" };

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) return { totalAgents: 0, totalCalls: 0, totalRevenue: "0", avgRating: "0" };

    const db = getDb();

    // Get creator record
    const creatorRows = await db
      .select()
      .from(creators)
      .where(eq(creators.walletAddress, walletAddress))
      .limit(1);

    if (!creatorRows.length) {
      return { totalAgents: 0, totalCalls: 0, totalRevenue: "0", avgRating: "0" };
    }

    const creatorId = creatorRows[0].id;

    const [stats] = await db
      .select({
        totalAgents: count(agents.id),
        totalCalls: sum(agents.totalCalls),
        avgRating: avg(agents.ratingAvg),
      })
      .from(agents)
      .where(eq(agents.creatorId, creatorId));

    const revenueRows = await db
      .select({ total: sum(transactions.creatorPayout) })
      .from(transactions)
      .leftJoin(agents, eq(transactions.agentId, agents.id))
      .where(eq(agents.creatorId, creatorId));

    return {
      totalAgents: Number(stats?.totalAgents ?? 0),
      totalCalls: Number(stats?.totalCalls ?? 0),
      totalRevenue: revenueRows[0]?.total ?? "0",
      avgRating: stats?.avgRating ?? "0",
    };
  } catch {
    return { totalAgents: 0, totalCalls: 0, totalRevenue: "0", avgRating: "0" };
  }
}

export interface PaginatedTransactions {
  transactions: Transaction[];
  nextCursor?: string;
}

export async function getMyTransactions(params: { cursor?: string; limit?: number } = {}): Promise<PaginatedTransactions> {
  try {
    const session = await auth();
    if (!session?.user) return { transactions: [] };

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) return { transactions: [] };

    const db = getDb();
    const { limit = 20 } = params;

    const creatorRows = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.walletAddress, walletAddress))
      .limit(1);

    if (!creatorRows.length) return { transactions: [] };

    const creatorAgents = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.creatorId, creatorRows[0].id));

    if (!creatorAgents.length) return { transactions: [] };

    const agentIds = creatorAgents.map((a) => a.id);

    // Fetch transactions for all creator's agents
    const rows = await db
      .select()
      .from(transactions)
      .where(inArray(transactions.agentId, agentIds))
      .orderBy(desc(transactions.createdAt))
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { transactions: data as unknown as Transaction[], nextCursor };
  } catch {
    return { transactions: [] };
  }
}
