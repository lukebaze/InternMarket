import { NextResponse } from "next/server";
import { createNodeClient, agents, agentVersions, downloads } from "@repo/db";
import { eq, and, sql } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { generateDownloadUrl } from "@/lib/storage/download-package";
import { ensureCreator } from "@/lib/actions/creator-actions";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** Hash IP address for privacy-safe analytics */
async function hashIp(ip: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
  return Buffer.from(buf).toString("hex").slice(0, 16);
}

/** GET /api/agents/:slug/download — download package (public, auth optional) */
export async function GET(request: Request, { params }: Params) {
  try {
    const { slug } = await params;
    const db = getDb();
    const url = new URL(request.url);
    const versionParam = url.searchParams.get("version") || undefined;

    const [agent] = await db
      .select({ id: agents.id, currentVersion: agents.currentVersion, packageUrl: agents.packageUrl })
      .from(agents)
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!agent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    const targetVersion = versionParam ?? agent.currentVersion;
    const [versionRow] = await db
      .select({ id: agentVersions.id, packageUrl: agentVersions.packageUrl, version: agentVersions.version })
      .from(agentVersions)
      .where(and(eq(agentVersions.agentId, agent.id), eq(agentVersions.version, targetVersion)))
      .limit(1);

    const packageKey = versionRow?.packageUrl ?? agent.packageUrl;

    await db
      .update(agents)
      .set({ downloads: sql`${agents.downloads} + 1` })
      .where(eq(agents.id, agent.id));

    if (versionRow) {
      await db
        .update(agentVersions)
        .set({ downloads: sql`${agentVersions.downloads} + 1` })
        .where(eq(agentVersions.id, versionRow.id));
    }

    // Resolve userId if authenticated (optional)
    let userId: string | null = null;
    try {
      const { userId: clerkUserId } = await auth();
      if (clerkUserId) {
        userId = await ensureCreator(clerkUserId);
      }
    } catch {
      // anonymous download is fine
    }

    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const ipHash = await hashIp(ip);

    await db.insert(downloads).values({
      agentId: agent.id,
      versionId: versionRow?.id ?? null,
      userId,
      ipHash,
      version: targetVersion,
    });

    const downloadUrl = await generateDownloadUrl(packageKey);
    return NextResponse.redirect(downloadUrl);
  } catch (err) {
    console.error("[GET /api/agents/:slug/download]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
