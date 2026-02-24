import { agents, creators } from "@repo/db";
import { eq, and, or, ilike, desc, asc, sql } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

export interface DiscoveryParams {
  q?: string;
  category?: string;
  trustTier?: string;
  tags?: string;
  sort?: string;
  order?: string;
  limit?: number;
  offset?: number;
}

const SORT_COLUMNS = {
  downloads: agents.downloads,
  ratingAvg: agents.ratingAvg,
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
    tags,
    sort = "downloads",
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
  if (tags) {
    // Filter agents whose tags array overlaps with provided tags (comma-separated)
    const tagList = tags.split(",").map((t) => t.trim()).filter(Boolean);
    if (tagList.length > 0) {
      const tagArray = `{${tagList.map((t) => `"${t}"`).join(",")}}`;
      conditions.push(sql`${agents.tags} && ${tagArray}::text[]`);
    }
  }

  const whereClause = conditions.length > 1 ? and(...conditions) : conditions[0];

  const sortColumn = SORT_COLUMNS[sort as keyof typeof SORT_COLUMNS] ?? SORT_COLUMNS.downloads;
  const orderFn = order === "asc" ? asc(sortColumn) : desc(sortColumn);

  const rows = await db
    .select({
      id: agents.id,
      slug: agents.slug,
      name: agents.name,
      description: agents.description,
      category: agents.category,
      tags: agents.tags,
      currentVersion: agents.currentVersion,
      downloads: agents.downloads,
      ratingAvg: agents.ratingAvg,
      ratingCount: agents.ratingCount,
      trustTier: agents.trustTier,
      status: agents.status,
      iconUrl: agents.iconUrl,
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

  return { agents: rows, total };
}
