import { NextResponse } from "next/server";
import { createNodeClient, agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { listAgentRatings, submitRating } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/** Strip HTML tags from review text to prevent XSS */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
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

    return NextResponse.json({ ratings: result.ratings, total: result.total, limit, offset });
  } catch (err) {
    console.error("[GET /api/agents/:slug/ratings]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** POST /api/agents/:slug/ratings — submit rating for this agent (authenticated) */
export async function POST(request: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

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

    const body = await request.json();
    const { score, review } = body;

    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: "score must be integer 1-5" }, { status: 400 });
    }
    if (review !== undefined && review !== null) {
      if (typeof review !== "string" || review.length > 1000) {
        return NextResponse.json({ error: "review must be string, max 1000 chars" }, { status: 400 });
      }
    }

    // Resolve creator by clerkUserId
    const [creator] = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creator) {
      return NextResponse.json({ error: "Creator profile not found. Visit dashboard first." }, { status: 403 });
    }

    const sanitizedReview = review ? stripHtml(review) : undefined;
    const rating = await submitRating(db, {
      agentId: agent.id,
      userId: creator.id,
      score,
      review: sanitizedReview,
    });

    return NextResponse.json({ rating }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/agents/:slug/ratings]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
