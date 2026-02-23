"use server";

import type { Agent, AgentCategory, TrustTier } from "@repo/types";
import { slugify } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { creators } from "@repo/db";
import { eq, ilike, and, or, desc, asc, gte, lte, inArray } from "drizzle-orm";
import { ensureCreator } from "./creator-actions";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

export type SortOption = "trust" | "price_asc" | "price_desc" | "newest" | "popular";

export interface GetAgentsParams {
  search?: string;
  category?: AgentCategory;
  trustTier?: TrustTier[];
  priceMin?: string;
  priceMax?: string;
  sort?: SortOption;
  cursor?: string;
  limit?: number;
}

export interface PaginatedAgents {
  agents: Agent[];
  nextCursor?: string;
}

export async function getAgents(params: GetAgentsParams = {}): Promise<PaginatedAgents> {
  try {
    const db = getDb();
    const { search, category, trustTier, priceMin, priceMax, sort = "trust", limit = 12 } = params;

    const conditions = [];

    // Search on both name and description
    if (search) {
      conditions.push(or(ilike(agents.name, `%${search}%`), ilike(agents.description, `%${search}%`)));
    }
    if (category) conditions.push(eq(agents.category, category));
    if (trustTier?.length) conditions.push(inArray(agents.trustTier, trustTier));
    if (priceMin) conditions.push(gte(agents.pricePerCall, priceMin));
    if (priceMax) conditions.push(lte(agents.pricePerCall, priceMax));
    conditions.push(eq(agents.status, "active"));

    // Sort mapping
    const orderBy = {
      trust: desc(agents.trustScore),
      price_asc: asc(agents.pricePerCall),
      price_desc: desc(agents.pricePerCall),
      newest: desc(agents.createdAt),
      popular: desc(agents.totalCalls),
    }[sort];

    const rows = await db
      .select()
      .from(agents)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(orderBy)
      .limit(limit + 1);

    const hasMore = rows.length > limit;
    const data = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore ? data[data.length - 1].id : undefined;

    return { agents: data as unknown as Agent[], nextCursor };
  } catch {
    return { agents: [] };
  }
}

export async function getAgentBySlug(slug: string): Promise<(Agent & { creator?: { displayName?: string | null; walletAddress: string } }) | null> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        agent: agents,
        creatorWallet: creators.walletAddress,
        creatorDisplayName: creators.displayName,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!rows.length) return null;
    const { agent, creatorWallet, creatorDisplayName } = rows[0];
    return {
      ...(agent as unknown as Agent),
      creator: { walletAddress: creatorWallet ?? "", displayName: creatorDisplayName },
    };
  } catch {
    return null;
  }
}

export async function createAgent(formData: FormData): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) return { success: false, error: "No wallet address" };

    const db = getDb();
    const creatorId = await ensureCreator(walletAddress);

    const name = formData.get("name") as string;
    const slug = slugify(name);

    await db.insert(agents).values({
      slug,
      creatorId,
      name,
      description: formData.get("description") as string,
      category: formData.get("category") as AgentCategory,
      mcpEndpoint: formData.get("mcpEndpoint") as string,
      creatorWallet: walletAddress,
      pricePerCall: formData.get("pricePerCall") as string,
      status: "active",
    });

    return { success: true, slug };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateAgent(id: string, formData: FormData): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user) return { success: false, error: "Not authenticated" };

    const walletAddress = (session.user as { address?: string }).address;
    const db = getDb();

    const existing = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    if (!existing.length || existing[0].creatorWallet !== walletAddress) {
      return { success: false, error: "Not authorized" };
    }

    await db.update(agents).set({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as AgentCategory,
      mcpEndpoint: formData.get("mcpEndpoint") as string,
      pricePerCall: formData.get("pricePerCall") as string,
      updatedAt: new Date(),
    }).where(eq(agents.id, id));

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    const session = await auth();
    if (!session?.user) return;

    const walletAddress = (session.user as { address?: string }).address;
    const db = getDb();

    const existing = await db.select().from(agents).where(eq(agents.id, id)).limit(1);
    if (!existing.length || existing[0].creatorWallet !== walletAddress) return;

    await db.delete(agents).where(eq(agents.id, id));
  } catch {
    // silent
  }
}
