import { NextResponse } from "next/server";
import { createNodeClient, agents, agentVersions } from "@repo/db";
import { auth } from "@clerk/nextjs/server";
import { confirmUpload } from "@/lib/storage/upload-package";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug-generator";
import { ensureCreator } from "@/lib/actions/creator-actions";
import { buildDiscoveryQuery } from "@/lib/agent-discovery-query";

const VALID_CATEGORIES = [
  "marketing", "assistant", "copywriting", "coding", "pm",
  "trading", "social", "devops", "data", "design",
];

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/** GET /api/agents — discovery with search/filter/sort/pagination (public) */
export async function GET(request: Request) {
  try {
    const db = getDb();
    const url = new URL(request.url);
    const params = {
      q: url.searchParams.get("q") || undefined,
      category: url.searchParams.get("category") || undefined,
      trustTier: url.searchParams.get("trustTier") || undefined,
      tags: url.searchParams.get("tags") || undefined,
      sort: url.searchParams.get("sort") || "downloads",
      order: url.searchParams.get("order") || "desc",
      limit: Math.max(1, Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100)),
      offset: Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0),
    };

    const result = await buildDiscoveryQuery(db, params);

    return NextResponse.json({
      agents: result.agents,
      total: result.total,
      limit: params.limit,
      offset: params.offset,
    }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[GET /api/agents]", err);
    return NextResponse.json({ agents: [], total: 0, limit: 20, offset: 0 });
  }
}

/** POST /api/agents — create agent with package (authenticated) */
export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, category, tags, packageKey, version, changelog } = body;

    if (!name || typeof name !== "string" || name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: "name must be 3-100 chars", field: "name" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`, field: "category" }, { status: 400 });
    }
    if (!version || typeof version !== "string" || !/^\d+\.\d+\.\d+/.test(version)) {
      return NextResponse.json({ error: "version must be semver (e.g. 1.0.0)", field: "version" }, { status: 400 });
    }
    if (!packageKey || typeof packageKey !== "string") {
      return NextResponse.json({ error: "packageKey is required", field: "packageKey" }, { status: 400 });
    }

    const upload = await confirmUpload(packageKey);
    if (!upload.exists) {
      return NextResponse.json({ error: "Package not found in storage. Upload first.", field: "packageKey" }, { status: 400 });
    }

    const db = getDb();
    const creatorId = await ensureCreator(userId);
    const slug = await ensureUniqueSlug(db, generateSlug(name));

    const [agent] = await db.insert(agents).values({
      slug,
      creatorId,
      name,
      description: description ?? "",
      category,
      tags: Array.isArray(tags) ? tags : [],
      currentVersion: version,
      packageUrl: packageKey,
      packageSize: upload.size ?? 0,
      status: "active",
    }).returning();

    const [agentVersion] = await db.insert(agentVersions).values({
      agentId: agent.id,
      version,
      packageUrl: packageKey,
      packageSize: upload.size ?? 0,
      sha256Hash: "pending",
      changelog: changelog ?? null,
    }).returning();

    return NextResponse.json({ agent, version: agentVersion }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/agents]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
