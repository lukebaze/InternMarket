import { pgTable, text, uuid, decimal, timestamp } from "drizzle-orm/pg-core";

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: text("wallet_address").unique().notNull(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  totalRevenue: decimal("total_revenue", { precision: 18, scale: 6 }).default("0"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
