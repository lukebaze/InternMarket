import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import { listAgentRatings } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** GET /api/agents/:slug/ratings — list ratings for an agent (public) */
export async function GET(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const db = getDb();

    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const limit = Math.max(1, Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100));
    const offset = Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0);

    const result = await listAgentRatings(db, agent.id, limit, offset);

    return NextResponse.json({
      ratings: result.ratings,
      total: result.total,
      limit,
      offset,
    });
  } catch (err) {
    console.error("[GET /api/agents/:slug/ratings]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
