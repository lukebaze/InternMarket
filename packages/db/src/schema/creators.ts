import { pgTable, text, uuid, integer, timestamp } from "drizzle-orm/pg-core";

export const creators = pgTable("creators", {
  id: uuid("id").primaryKey().defaultRandom(),
  // Primary identity field — Clerk userId
  clerkUserId: text("clerk_user_id").unique().notNull(),
  email: text("email"),
  stripeConnectId: text("stripe_connect_id"),
  // Legacy/optional — wallet address for web3 identity (no longer required)
  walletAddress: text("wallet_address").unique(),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  bio: text("bio"),
  githubUsername: text("github_username"),
  githubId: text("github_id"),
  totalDownloads: integer("total_downloads").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Creator = typeof creators.$inferSelect;
export type NewCreator = typeof creators.$inferInsert;
