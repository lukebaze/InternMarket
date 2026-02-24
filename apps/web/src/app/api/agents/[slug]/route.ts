import { NextResponse } from "next/server";
import { createNodeClient, agents, creators, agentVersions } from "@repo/db";
import { eq, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

const VALID_CATEGORIES = [
  "marketing", "assistant", "copywriting", "coding", "pm",
  "trading", "social", "devops", "data", "design",
];

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** GET /api/agents/:slug — public single agent detail with creator info */
export async function GET(_request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const db = getDb();

    const rows = await db
      .select({
        id: agents.id,
        slug: agents.slug,
        name: agents.name,
        description: agents.description,
        category: agents.category,
        tags: agents.tags,
        currentVersion: agents.currentVersion,
        packageUrl: agents.packageUrl,
        packageSize: agents.packageSize,
        readmeHtml: agents.readmeHtml,
        iconUrl: agents.iconUrl,
        downloads: agents.downloads,
        ratingAvg: agents.ratingAvg,
        ratingCount: agents.ratingCount,
        trustTier: agents.trustTier,
        status: agents.status,
        remixedFromId: agents.remixedFromId,
        createdAt: agents.createdAt,
        updatedAt: agents.updatedAt,
        creatorDisplayName: creators.displayName,
        creatorAvatarUrl: creators.avatarUrl,
        creatorGithubUsername: creators.githubUsername,
        versionCount: sql<number>`(SELECT COUNT(*) FROM agent_versions WHERE agent_id = ${agents.id})`,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!rows.length) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const row = rows[0];
    return NextResponse.json({
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description,
      category: row.category,
      tags: row.tags,
      currentVersion: row.currentVersion,
      packageUrl: row.packageUrl,
      packageSize: row.packageSize,
      readmeHtml: row.readmeHtml,
      iconUrl: row.iconUrl,
      downloads: row.downloads,
      ratingAvg: row.ratingAvg,
      ratingCount: row.ratingCount,
      trustTier: row.trustTier,
      status: row.status,
      remixedFromId: row.remixedFromId,
      versionCount: Number(row.versionCount),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      creator: {
        displayName: row.creatorDisplayName ?? null,
        avatarUrl: row.creatorAvatarUrl ?? null,
        githubUsername: row.creatorGithubUsername ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/agents/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** Resolve creator clerkUserId from agent slug for ownership check */
async function getOwnerKey(db: ReturnType<typeof getDb>, slug: string) {
  const rows = await db
    .select({ agentId: agents.id, ownerKey: creators.clerkUserId })
    .from(agents)
    .leftJoin(creators, eq(agents.creatorId, creators.id))
    .where(eq(agents.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

/** PUT /api/agents/:slug — update agent metadata (owner only) */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    const owner = await getOwnerKey(db, slug);
    if (!owner) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (owner.ownerKey !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.name !== undefined) {
      if (typeof body.name !== "string" || body.name.length < 3 || body.name.length > 100) {
        return NextResponse.json({ error: "name must be 3-100 chars", field: "name" }, { status: 400 });
      }
      updates.name = body.name;
    }
    if (body.description !== undefined) updates.description = body.description;
    if (body.category !== undefined) {
      if (!VALID_CATEGORIES.includes(body.category)) {
        return NextResponse.json({ error: "Invalid category", field: "category" }, { status: 400 });
      }
      updates.category = body.category;
    }
    if (body.tags !== undefined) {
      updates.tags = Array.isArray(body.tags) ? body.tags : [];
    }
    if (body.iconUrl !== undefined) updates.iconUrl = body.iconUrl;

    updates.updatedAt = new Date();

    const [updated] = await db
      .update(agents)
      .set(updates)
      .where(eq(agents.slug, slug))
      .returning();

    return NextResponse.json({ agent: updated });
  } catch (err) {
    console.error("[PUT /api/agents/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** DELETE /api/agents/:slug — soft-delete (owner only, sets status to suspended) */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    const owner = await getOwnerKey(db, slug);
    if (!owner) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (owner.ownerKey !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    await db
      .update(agents)
      .set({ status: "suspended", updatedAt: new Date() })
      .where(eq(agents.slug, slug));

    // suppress unused import
    void agentVersions;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/agents/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
