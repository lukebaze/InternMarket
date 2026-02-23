import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { checkRatingEligibility, getExistingRating } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** GET /api/ratings/eligible/:slug — check if user can rate this agent */
export async function GET(_request: Request, { params }: Params) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const wallet = (session.user as { address?: string }).address;
    if (!wallet) {
      return NextResponse.json({ error: "No wallet address" }, { status: 401 });
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

    const { eligible, reason } = await checkRatingEligibility(db, agent.id, wallet);
    const existing = await getExistingRating(db, agent.id, wallet);

    return NextResponse.json({
      eligible,
      reason: eligible ? undefined : reason,
      existingRating: existing
        ? { score: existing.score, review: existing.review }
        : undefined,
    });
  } catch (err) {
    console.error("[GET /api/ratings/eligible/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
