"use server";

import type { Agent, AgentCategory } from "@repo/types";
import { slugify } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { createNodeClient } from "@repo/db";
import { agents, creators } from "@repo/db";
import { eq, ilike, and, desc } from "drizzle-orm";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

export interface GetAgentsParams {
  search?: string;
  category?: AgentCategory;
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
    const { search, category, limit = 12 } = params;

    const conditions = [];
    if (search) conditions.push(ilike(agents.name, `%${search}%`));
    if (category) conditions.push(eq(agents.category, category));
    conditions.push(eq(agents.status, "active"));

    const rows = await db
      .select()
      .from(agents)
      .where(conditions.length > 1 ? and(...conditions) : conditions[0])
      .orderBy(desc(agents.ratingAvg))
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

    // Upsert creator
    const existingCreators = await db
      .select()
      .from(creators)
      .where(eq(creators.walletAddress, walletAddress))
      .limit(1);

    let creatorId: string;
    if (existingCreators.length) {
      creatorId = existingCreators[0].id;
    } else {
      const inserted = await db
        .insert(creators)
        .values({ walletAddress })
        .returning({ id: creators.id });
      creatorId = inserted[0].id;
    }

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
