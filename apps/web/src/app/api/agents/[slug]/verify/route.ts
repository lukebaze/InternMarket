/**
 * POST /api/agents/:slug/verify — manually trigger verification pipeline.
 * Intended for admins or re-triggering after failure.
 * Requires ADMIN_USER_IDS env var (comma-separated Clerk user IDs) or agent owner.
 */
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { createNodeClient, agents, creators } from "@repo/db";
import { eq } from "drizzle-orm";
import { runVerificationPipeline } from "@/lib/verification/verification-pipeline";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

function isAdmin(userId: string): boolean {
  const adminIds = process.env.ADMIN_USER_IDS ?? "";
  return adminIds.split(",").map((s) => s.trim()).includes(userId);
}

type Params = { params: Promise<{ slug: string }> };

export async function POST(_request: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    const [row] = await db
      .select({
        id: agents.id,
        packageUrl: agents.packageUrl,
        ownerClerkId: creators.clerkUserId,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!row) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Only agent owner or admin can trigger verification
    if (row.ownerClerkId !== userId && !isAdmin(userId)) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    // Run pipeline asynchronously
    runVerificationPipeline(row.id, row.packageUrl).catch((err) => {
      console.error("[verify-route]", err);
    });

    return NextResponse.json({ message: "Verification started", agentId: row.id });
  } catch (err) {
    console.error("[POST /api/agents/:slug/verify]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
