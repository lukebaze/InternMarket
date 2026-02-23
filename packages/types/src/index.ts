// Agent marketplace shared types

export type AgentCategory =
  | "marketing"
  | "assistant"
  | "copywriting"
  | "coding"
  | "pm"
  | "trading"
  | "social";

export type AgentStatus = "active" | "paused" | "under_review";
export type TransactionStatus = "pending" | "completed" | "failed" | "refunded";
export type TrustTier = "new" | "bronze" | "silver" | "gold" | "platinum";

export interface AgentTool {
  name: string;
  description: string;
}

export interface AgentCard {
  // Raw MCP Registry metadata - flexible structure
  [key: string]: unknown;
}

export interface Creator {
  id: string;
  walletAddress: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  totalRevenue: string; // decimal as string
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
  mcpEndpoint: string;
  creatorWallet: string;
  pricePerCall: string;
  agentCard: AgentCard | null;
  tools: AgentTool[] | null;
  ratingAvg: string;
  totalCalls: number;
  status: AgentStatus;
  trustScore: string;
  trustTier: TrustTier;
  uptime30d: string;
  successRate30d: string;
  p95LatencyMs: number;
  uniqueConsumers30d: number;
  healthCheckFailures: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Transaction {
  id: string;
  agentId: string;
  consumerWallet: string;
  amount: string;
  platformFee: string;
  creatorPayout: string;
  x402PaymentHash: string | null;
  status: TransactionStatus;
  createdAt: Date;
}

export interface Rating {
  id: string;
  agentId: string;
  userWallet: string;
  score: number;
  review: string | null;
  createdAt: Date;
}

export interface AgentMetric {
  id: string;
  agentId: string;
  timestamp: Date;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  uniqueConsumers: number;
}

export interface AgentShowcase {
  id: string;
  agentId: string;
  title: string;
  description: string;
  inputExample: string;
  outputExample: string;
  sortOrder: number;
  createdAt: Date;
}
