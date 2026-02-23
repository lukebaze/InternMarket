import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { checkRatingEligibility, submitRating } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/** Strip HTML tags from review text to prevent XSS */
function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/** POST /api/ratings — submit or update a rating (authenticated) */
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wallet = (session.user as { address?: string }).address;
    if (!wallet) {
      return NextResponse.json({ error: "No wallet address" }, { status: 401 });
    }

    const body = await request.json();
    const { agentSlug, score, review } = body;

    // Validate inputs
    if (!agentSlug || typeof agentSlug !== "string") {
      return NextResponse.json({ error: "agentSlug is required" }, { status: 400 });
    }
    if (typeof score !== "number" || !Number.isInteger(score) || score < 1 || score > 5) {
      return NextResponse.json({ error: "score must be integer 1-5" }, { status: 400 });
    }
    if (review !== undefined && review !== null) {
      if (typeof review !== "string" || review.length > 1000) {
        return NextResponse.json({ error: "review must be string, max 1000 chars" }, { status: 400 });
      }
    }

    const db = getDb();

    // Lookup agent by slug
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.slug, agentSlug))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Check eligibility (must have completed transaction)
    const { eligible, reason } = await checkRatingEligibility(db, agent.id, wallet);
    if (!eligible) {
      return NextResponse.json({ error: reason }, { status: 403 });
    }

    // Submit rating (upsert) + recalculate avg
    const sanitizedReview = review ? stripHtml(review) : undefined;
    const rating = await submitRating(db, {
      agentId: agent.id,
      userWallet: wallet,
      score,
      review: sanitizedReview,
    });

    return NextResponse.json({ rating }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/ratings]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
