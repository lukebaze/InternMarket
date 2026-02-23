import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { validateMcpEndpoint } from "@/lib/mcp-validator";

const VALID_CATEGORIES = [
  "marketing", "assistant", "coding", "trading", "social", "copywriting", "pm",
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
        pricePerCall: agents.pricePerCall,
        tools: agents.tools,
        agentCard: agents.agentCard,
        ratingAvg: agents.ratingAvg,
        totalCalls: agents.totalCalls,
        status: agents.status,
        trustScore: agents.trustScore,
        trustTier: agents.trustTier,
        creatorWallet: agents.creatorWallet,
        createdAt: agents.createdAt,
        creatorDisplayName: creators.displayName,
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
      pricePerCall: row.pricePerCall,
      tools: row.tools,
      agentCard: row.agentCard,
      ratingAvg: row.ratingAvg,
      totalCalls: row.totalCalls,
      status: row.status,
      trustScore: row.trustScore,
      trustTier: row.trustTier,
      createdAt: row.createdAt,
      creator: {
        walletAddress: row.creatorWallet ?? "",
        displayName: row.creatorDisplayName ?? null,
      },
    });
  } catch (err) {
    console.error("[GET /api/agents/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** PUT /api/agents/:slug — update agent (owner only) */
export async function PUT(request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) {
      return NextResponse.json({ error: "No wallet address" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    // Lookup + ownership check
    const existing = await db
      .select()
      .from(agents)
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    if (existing[0].creatorWallet !== walletAddress) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = {};

    // Validate and collect partial updates
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
    if (body.pricePerCall !== undefined) {
      if (isNaN(Number(body.pricePerCall)) || Number(body.pricePerCall) <= 0) {
        return NextResponse.json({ error: "pricePerCall must be positive", field: "pricePerCall" }, { status: 400 });
      }
      updates.pricePerCall = String(body.pricePerCall);
    }

    // If endpoint changed, re-validate MCP
    if (body.endpoint !== undefined && body.endpoint !== existing[0].mcpEndpoint) {
      const validation = await validateMcpEndpoint(body.endpoint);
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error, field: "endpoint" }, { status: 400 });
      }
      updates.mcpEndpoint = body.endpoint;
      if (validation.tools?.length) updates.tools = validation.tools;
      if (validation.name) updates.agentCard = { name: validation.name };
    }

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

/** DELETE /api/agents/:slug — soft-delete (owner only, sets status to paused) */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const walletAddress = (session.user as { address?: string }).address;
    if (!walletAddress) {
      return NextResponse.json({ error: "No wallet address" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    const existing = await db
      .select()
      .from(agents)
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!existing.length) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    if (existing[0].creatorWallet !== walletAddress) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Soft delete — preserve transaction history
    await db
      .update(agents)
      .set({ status: "paused", updatedAt: new Date() })
      .where(eq(agents.slug, slug));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/agents/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
