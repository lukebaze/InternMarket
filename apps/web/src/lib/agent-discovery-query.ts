import { agents, creators } from "@repo/db";
import { eq, and, or, ilike, gte, lte, desc, asc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface DiscoveryParams {
  q?: string;
  category?: string;
  trustTier?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

const SORT_COLUMNS = {
  trustScore: agents.trustScore,
  ratingAvg: agents.ratingAvg,
  totalCalls: agents.totalCalls,
  pricePerCall: agents.pricePerCall,
  createdAt: agents.createdAt,
} as const;

/** Escape LIKE special characters to prevent wildcard injection */
function escapeLike(input: string): string {
  return input.replace(/%/g, "\\%").replace(/_/g, "\\_");
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function buildDiscoveryQuery(db: NodePgDatabase<any>, params: DiscoveryParams) {
  const {
    q,
    category,
    trustTier,
    minPrice,
    maxPrice,
    sort = "trustScore",
    order = "desc",
    limit = 20,
    offset = 0,
  } = params;

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

  // Type-safe sort column mapping
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

  // Count total for pagination
  const countResult = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(agents)
    .where(whereClause);

  const total = Number(countResult[0]?.count ?? 0);

  const agentCards = rows.map((r) => ({
    ...r,
    toolCount: Array.isArray(r.tools) ? r.tools.length : 0,
    tools: undefined, // omit raw tools from list response
  }));

  return { agents: agentCards, total };
}
