/**
 * Slug generation + uniqueness check for agent registration.
 * Uses kebab-case, strips special chars, appends counter on collision.
 */

import { agents } from "@repo/db";
import { eq } from "drizzle-orm";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

/** Generate kebab-case slug from name (max 60 chars) */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

/** Ensure slug is unique in DB — appends -2, -3, etc. on collision */
export async function ensureUniqueSlug(
  db: NodePgDatabase<Record<string, unknown>>,
  baseSlug: string,
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db
      .select({ id: agents.id })
      .from(agents)
      .where(eq(agents.slug, slug))
      .limit(1);

    if (!existing.length) return slug;

    counter++;
    slug = `${baseSlug}-${counter}`;
  }
}
