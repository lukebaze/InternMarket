"use server";

import type { Agent, AgentCategory, TrustTier } from "@repo/types";
import { slugify } from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";
import { createNodeClient } from "@repo/db";
import { agents, creators } from "@repo/db";
import { eq, ilike, and, or, desc, asc, inArray, sql } from "drizzle-orm";
import { ensureCreator } from "./creator-actions";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

export type SortOption = "newest" | "popular" | "rating";

export interface GetAgentsParams {
  search?: string;
  category?: AgentCategory;
  trustTier?: TrustTier[];
  sort?: SortOption;
  tags?: string[];
  limit?: number;
}

export interface PaginatedAgents {
  agents: Agent[];
  nextCursor?: string;
}

export async function getAgents(params: GetAgentsParams = {}): Promise<PaginatedAgents> {
  try {
    const db = getDb();
    const { search, category, trustTier, sort = "popular", tags, limit = 12 } = params;

    const conditions = [];

    if (search) {
      conditions.push(or(ilike(agents.name, `%${search}%`), ilike(agents.description, `%${search}%`)));
    }
    if (category) conditions.push(eq(agents.category, category));
    if (trustTier?.length) conditions.push(inArray(agents.trustTier, trustTier));
    if (tags?.length) {
      conditions.push(sql`${agents.tags} && ARRAY[${sql.join(tags.map((t) => sql`${t}`), sql`, `)}]::text[]`);
    }
    conditions.push(eq(agents.status, "active"));

    const orderBy = {
      popular: desc(agents.downloads),
      newest: desc(agents.createdAt),
      rating: desc(agents.ratingAvg),
    }[sort];

    // suppress unused import warning for asc
    void asc;

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

export async function getAgentBySlug(
  slug: string,
): Promise<(Agent & { creator?: { displayName?: string | null; clerkUserId: string } }) | null> {
  try {
    const db = getDb();
    const rows = await db
      .select({
        agent: agents,
        creatorClerkId: creators.clerkUserId,
        creatorDisplayName: creators.displayName,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!rows.length) return null;
    const { agent, creatorClerkId, creatorDisplayName } = rows[0];
    return {
      ...(agent as unknown as Agent),
      creator: { clerkUserId: creatorClerkId ?? "", displayName: creatorDisplayName },
    };
  } catch {
    return null;
  }
}

export async function createAgent(
  formData: FormData,
): Promise<{ success: boolean; slug?: string; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();
    const creatorId = await ensureCreator(userId);

    const name = formData.get("name") as string;
    const slug = slugify(name);
    const version = (formData.get("version") as string) || "1.0.0";
    const packageKey = formData.get("packageKey") as string;

    if (!packageKey) return { success: false, error: "packageKey is required" };

    await db.insert(agents).values({
      slug,
      creatorId,
      name,
      description: formData.get("description") as string,
      category: formData.get("category") as AgentCategory,
      currentVersion: version,
      packageUrl: packageKey,
      packageSize: 0,
      status: "active",
    });

    return { success: true, slug };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function updateAgent(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, error: "Not authenticated" };

    const db = getDb();

    // Ownership check via clerkUserId
    const rows = await db
      .select({ agentId: agents.id, ownerClerkId: creators.clerkUserId })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.id, id))
      .limit(1);

    if (!rows.length || rows[0].ownerClerkId !== userId) {
      return { success: false, error: "Not authorized" };
    }

    await db.update(agents).set({
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      category: formData.get("category") as AgentCategory,
      updatedAt: new Date(),
    }).where(eq(agents.id, id));

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : "Unknown error" };
  }
}

export async function deleteAgent(id: string): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) return;

    const db = getDb();

    const rows = await db
      .select({ ownerClerkId: creators.clerkUserId })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.id, id))
      .limit(1);

    if (!rows.length || rows[0].ownerClerkId !== userId) return;

    await db.delete(agents).where(eq(agents.id, id));
  } catch {
    // silent
  }
}
