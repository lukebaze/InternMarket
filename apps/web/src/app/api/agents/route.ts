import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { agents } from "@repo/db";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const url = process.env.DATABASE_URL;
    if (!url) {
      return NextResponse.json({ agents: [] });
    }

    const db = createNodeClient(url);
    const rows = await db
      .select({
        id: agents.id,
        slug: agents.slug,
        name: agents.name,
        category: agents.category,
        mcpEndpoint: agents.mcpEndpoint,
        creatorWallet: agents.creatorWallet,
        pricePerCall: agents.pricePerCall,
        status: agents.status,
      })
      .from(agents)
      .where(eq(agents.status, "active"));

    return NextResponse.json({ agents: rows });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
