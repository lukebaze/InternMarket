import { pgTable, text, uuid, decimal, integer, timestamp, index, numeric } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { creators } from "./creators";

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").unique().notNull(),
    creatorId: uuid("creator_id")
      .references(() => creators.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    tags: text("tags").array().default(sql`'{}'::text[]`),
    currentVersion: text("current_version").notNull(),
    packageUrl: text("package_url").notNull(),
    packageSize: integer("package_size").notNull(),
    readmeHtml: text("readme_html"),
    iconUrl: text("icon_url"),
    thumbnailUrl: text("thumbnail_url"),
    downloads: integer("downloads").default(0),
    ratingAvg: decimal("rating_avg", { precision: 3, scale: 2 }).default("0"),
    ratingCount: integer("rating_count").default(0),
    trustTier: text("trust_tier").default("new"),
    status: text("status").notNull().default("active"),
    // Pricing fields
    price: numeric("price", { precision: 10, scale: 2 }),
    pricingModel: text("pricing_model").default("free"), // free | one-time | subscription | enterprise
    // Permissions the agent requires
    permissions: text("permissions").array(),
    // Verification lifecycle
    verificationStatus: text("verification_status").default("pending"), // pending | scanning | verified | rejected
    // Renamed from forkedFromId for clarity
    remixedFromId: uuid("remixed_from_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("agents_creator_id_idx").on(table.creatorId),
    index("agents_status_idx").on(table.status),
    index("agents_status_category_idx").on(table.status, table.category),
    index("agents_slug_idx").on(table.slug),
  ]
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
