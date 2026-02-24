// AI intern package marketplace shared types

export type AgentCategory =
  | "marketing"
  | "assistant"
  | "copywriting"
  | "coding"
  | "pm"
  | "trading"
  | "social"
  | "devops"
  | "data"
  | "design";

export type AgentStatus = "active" | "under_review" | "suspended";
export type TrustTier = "new" | "bronze" | "silver" | "gold";
export type PricingModel = "free" | "one-time" | "subscription" | "enterprise";
export type VerificationStatus = "pending" | "scanning" | "verified" | "rejected";

export interface Creator {
  id: string;
  clerkUserId: string;
  email: string | null;
  stripeConnectId: string | null;
  // Legacy/optional — may be null for Clerk-only creators
  walletAddress: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  githubUsername: string | null;
  githubId: string | null;
  totalDownloads: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Agent {
  id: string;
  slug: string;
  creatorId: string;
  name: string;
  description: string;
  category: AgentCategory;
  tags: string[];
  currentVersion: string;
  packageUrl: string;
  packageSize: number;
  readmeHtml: string | null;
  iconUrl: string | null;
  thumbnailUrl: string | null;
  downloads: number;
  ratingAvg: string;
  ratingCount: number;
  trustTier: TrustTier;
  status: AgentStatus;
  // Pricing
  price: string | null;
  pricingModel: string;
  permissions: string[] | null;
  verificationStatus: string;
  // Renamed from forkedFromId
  remixedFromId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentVersion {
  id: string;
  agentId: string;
  version: string;
  packageUrl: string;
  packageSize: number;
  sha256Hash: string;
  changelog: string | null;
  downloads: number;
  createdAt: Date;
}

export interface Download {
  id: string;
  agentId: string;
  versionId: string | null;
  userId: string | null;
  ipHash: string;
  version: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  agentId: string;
  userId: string;
  score: number;
  review: string | null;
  createdAt: Date;
}

export interface Purchase {
  id: string;
  agentId: string;
  buyerClerkId: string;
  stripePaymentIntentId: string | null;
  amount: string | null;
  platformFee: string | null;
  creatorPayout: string | null;
  pricingModel: string | null;
  status: string;
  createdAt: Date;
}

// Package manifest (from .internagent/manifest.json)
export interface PackageManifest {
  name: string;
  version: string;
  slug: string;
  author: { name: string; wallet?: string; github?: string };
  description: string;
  category: AgentCategory;
  tags: string[];
  permissions: string[];
  compatibleClaude: string;
}
