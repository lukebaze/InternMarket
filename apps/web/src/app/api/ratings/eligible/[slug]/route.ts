import { NextResponse } from "next/server";
import { createNodeClient, agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { getExistingRating } from "@/lib/rating-service";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** GET /api/ratings/eligible/:slug — check if user can rate this agent */
export async function GET(_request: Request, { params }: Params) {
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

    // Resolve creator by clerkUserId
    const [creator] = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.clerkUserId, userId))
      .limit(1);

    if (!creator) {
      return NextResponse.json({ eligible: true, existingRating: undefined });
    }

    const existing = await getExistingRating(db, agent.id, creator.id);

    return NextResponse.json({
      eligible: true,
      existingRating: existing
        ? { score: existing.score, review: existing.review }
        : undefined,
    });
  } catch (err) {
    console.error("[GET /api/ratings/eligible/:slug]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
