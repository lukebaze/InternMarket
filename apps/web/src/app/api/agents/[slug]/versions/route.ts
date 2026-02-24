import { NextResponse } from "next/server";
import { createNodeClient, agents, agentVersions, creators } from "@repo/db";
import { eq, and, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { confirmUpload } from "@/lib/storage/upload-package";
import { runVerificationPipeline } from "@/lib/verification/verification-pipeline";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

type Params = { params: Promise<{ slug: string }> };

/** GET /api/agents/:slug/versions — list all versions (public) */
export async function GET(_request: Request, { params }: Params) {
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

    const versions = await db
      .select()
      .from(agentVersions)
      .where(eq(agentVersions.agentId, agent.id))
      .orderBy(desc(agentVersions.createdAt));

    return NextResponse.json({ versions });
  } catch (err) {
    console.error("[GET /api/agents/:slug/versions]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

/** POST /api/agents/:slug/versions — publish new version (owner only) */
export async function POST(request: Request, { params }: Params) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { slug } = await params;
    const db = getDb();

    // Ownership check via join — clerkUserId is the primary identity field
    const [agentRow] = await db
      .select({
        id: agents.id,
        currentVersion: agents.currentVersion,
        ownerKey: creators.clerkUserId,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!agentRow) return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    if (agentRow.ownerKey !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await request.json();
    const { packageKey, version, changelog } = body;

    if (!version || typeof version !== "string" || !/^\d+\.\d+\.\d+/.test(version)) {
      return NextResponse.json({ error: "version must be semver (e.g. 1.0.0)", field: "version" }, { status: 400 });
    }
    if (!packageKey || typeof packageKey !== "string") {
      return NextResponse.json({ error: "packageKey is required", field: "packageKey" }, { status: 400 });
    }

    const upload = await confirmUpload(packageKey);
    if (!upload.exists) {
      return NextResponse.json({ error: "Package not found in storage", field: "packageKey" }, { status: 400 });
    }

    const [existing] = await db
      .select({ id: agentVersions.id })
      .from(agentVersions)
      .where(and(eq(agentVersions.agentId, agentRow.id), eq(agentVersions.version, version)))
      .limit(1);

    if (existing) {
      return NextResponse.json({ error: `Version ${version} already exists` }, { status: 409 });
    }

    const [newVersion] = await db.insert(agentVersions).values({
      agentId: agentRow.id,
      version,
      packageUrl: packageKey,
      packageSize: upload.size ?? 0,
      sha256Hash: "pending",
      changelog: changelog ?? null,
    }).returning();

    await db
      .update(agents)
      .set({
        currentVersion: version,
        packageUrl: packageKey,
        packageSize: upload.size ?? 0,
        verificationStatus: "pending",
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentRow.id));

    // Trigger verification pipeline asynchronously — does not block response
    const creatorSig = (body.creatorSignature as string) ?? "";
    runVerificationPipeline(agentRow.id, packageKey, creatorSig).catch((err) => {
      console.error("[verification-pipeline]", err);
    });

    return NextResponse.json({ version: newVersion }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/agents/:slug/versions]", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
