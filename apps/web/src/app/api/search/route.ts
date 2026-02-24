import { NextResponse } from "next/server";
import { createNodeClient } from "@repo/db";
import { buildDiscoveryQuery } from "@/lib/agent-discovery-query";

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

/** GET /api/search — dedicated search endpoint (public) */
export async function GET(request: Request) {
  try {
    const db = getDb();
    const url = new URL(request.url);

    const params = {
      q: url.searchParams.get("q") || undefined,
      category: url.searchParams.get("category") || undefined,
      tags: url.searchParams.get("tags") || undefined,
      sort: url.searchParams.get("sort") || "downloads",
      order: url.searchParams.get("order") || "desc",
      limit: Math.max(1, Math.min(parseInt(url.searchParams.get("limit") || "20", 10) || 20, 100)),
      offset: Math.max(0, parseInt(url.searchParams.get("offset") || "0", 10) || 0),
    };

    const result = await buildDiscoveryQuery(db, params);

    return NextResponse.json({
      agents: result.agents,
      total: result.total,
      limit: params.limit,
      offset: params.offset,
    }, {
      headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
    });
  } catch (err) {
    console.error("[GET /api/search]", err);
    return NextResponse.json({ agents: [], total: 0, limit: 20, offset: 0 });
  }
}
