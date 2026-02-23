import type { Context } from "hono";
import { agents, creators } from "@repo/db";
import { eq, and, or, ilike, gte, lte, desc, asc, sql } from "drizzle-orm";
import type { GatewayDb } from "../lib/db";

const SORT_COLUMNS = {
  trustScore: agents.trustScore,
  ratingAvg: agents.ratingAvg,
  totalCalls: agents.totalCalls,
  pricePerCall: agents.pricePerCall,
  createdAt: agents.createdAt,
} as const;

function escapeLike(input: string): string {
  return input.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/** GET /agents — public marketplace discovery (programmatic consumers) */
export async function handleAgentDiscovery(c: Context, db: GatewayDb) {
  try {
    const q = c.req.query("q");
    const category = c.req.query("category");
    const trustTier = c.req.query("trustTier");
    const minPrice = c.req.query("minPrice");
    const maxPrice = c.req.query("maxPrice");
    const sort = c.req.query("sort") || "trustScore";
    const order = c.req.query("order") || "desc";
    const limit = Math.max(1, Math.min(parseInt(c.req.query("limit") || "20", 10) || 20, 100));
    const offset = Math.max(0, parseInt(c.req.query("offset") || "0", 10) || 0);

    const conditions = [eq(agents.status, "active")];

    if (q) {
      const pattern = `%${escapeLike(q)}%`;
      conditions.push(or(ilike(agents.name, pattern), ilike(agents.description, pattern))!);
    }
    if (category) conditions.push(eq(agents.category, category));
    if (trustTier) conditions.push(eq(agents.trustTier, trustTier));
    if (minPrice) conditions.push(gte(agents.pricePerCall, minPrice));
    if (maxPrice) conditions.push(lte(agents.pricePerCall, maxPrice));

    const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

    const sortColumn = SORT_COLUMNS[sort as keyof typeof SORT_COLUMNS] ?? SORT_COLUMNS.trustScore;
    const orderFn = order === "asc" ? asc(sortColumn) : desc(sortColumn);

    const rows = await db
      .select({
        id: agents.id,
        slug: agents.slug,
        name: agents.name,
        description: agents.description,
        category: agents.category,
        pricePerCall: agents.pricePerCall,
        trustTier: agents.trustTier,
        trustScore: agents.trustScore,
        ratingAvg: agents.ratingAvg,
        totalCalls: agents.totalCalls,
        status: agents.status,
        tools: agents.tools,
        creatorWallet: agents.creatorWallet,
        uptime30d: agents.uptime30d,
        createdAt: agents.createdAt,
        creatorName: creators.displayName,
      })
      .from(agents)
      .leftJoin(creators, eq(agents.creatorId, creators.id))
      .where(whereClause)
      .orderBy(orderFn)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`COUNT(*)` })
      .from(agents)
      .where(whereClause);

    const total = Number(countResult[0]?.count ?? 0);

    const agentCards = rows.map((r) => ({
      ...r,
      toolCount: Array.isArray(r.tools) ? r.tools.length : 0,
      tools: undefined,
    }));

    return c.json({ agents: agentCards, total, limit, offset }, 200, {
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    });
  } catch (err) {
    console.error("[GET /agents]", err);
    return c.json({ agents: [], total: 0, limit: 20, offset: 0 });
  }
}
