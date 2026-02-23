import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { auth } from "@/lib/auth";
import { validateMcpEndpoint } from "@/lib/mcp-validator";
import { generateSlug, ensureUniqueSlug } from "@/lib/slug-generator";
import { ensureCreator } from "@/lib/actions/creator-actions";
import { buildDiscoveryQuery } from "@/lib/agent-discovery-query";

const VALID_CATEGORIES = [
  "marketing", "assistant", "coding", "trading", "social", "copywriting", "pm",
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
      minPrice: url.searchParams.get("minPrice") || undefined,
      maxPrice: url.searchParams.get("maxPrice") || undefined,
      sort: url.searchParams.get("sort") || "trustScore",
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

/** POST /api/agents — create agent (authenticated, validates MCP endpoint) */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) {
      return NextResponse.json({ error: "No wallet address in session" }, { status: 401 });
    }

    // Parse + validate body
    const body = await request.json();
    const { endpoint, name, category, pricePerCall, description } = body;

    // Required fields
    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ error: "endpoint is required", field: "endpoint" }, { status: 400 });
    }
    if (!name || typeof name !== "string" || name.length < 3 || name.length > 100) {
      return NextResponse.json({ error: "name must be 3-100 chars", field: "name" }, { status: 400 });
    }
    if (!category || !VALID_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: `category must be one of: ${VALID_CATEGORIES.join(", ")}`, field: "category" }, { status: 400 });
    }
    if (!pricePerCall || isNaN(Number(pricePerCall)) || Number(pricePerCall) <= 0) {
      return NextResponse.json({ error: "pricePerCall must be a positive number", field: "pricePerCall" }, { status: 400 });
    }

    // Validate URL format (HTTPS required for production)
    try {
      const parsed = new URL(endpoint);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        return NextResponse.json({ error: "endpoint must be HTTP(S)" }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: "Invalid endpoint URL", field: "endpoint" }, { status: 400 });
    }

    // Validate MCP endpoint
    const validation = await validateMcpEndpoint(endpoint);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error, field: "endpoint" }, { status: 400 });
    }

    const db = getDb();

    // Upsert creator record
    const creatorId = await ensureCreator(walletAddress);

    // Generate unique slug
    const slug = await ensureUniqueSlug(db, generateSlug(name));

    // Auto-populate from MCP handshake
    const agentName = name || validation.name || "Unnamed Agent";
    const agentDescription = description || "";
    const tools = validation.tools || [];

    // Insert agent
    const [agent] = await db.insert(agents).values({
      slug,
      creatorId,
      name: agentName,
      description: agentDescription,
      category,
      mcpEndpoint: endpoint,
      creatorWallet: walletAddress,
      pricePerCall: String(pricePerCall),
      agentCard: validation.name ? { name: validation.name } : null,
      tools: tools.length ? tools : null,
      status: "active",
    }).returning();

    return NextResponse.json({ agent }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/agents]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
