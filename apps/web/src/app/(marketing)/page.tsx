import type { Metadata } from "next";

import { AnimatedLanding } from "@/components/marketing/animated-landing";

export const metadata: Metadata = {
  title: "Interns.market - AI Agent Marketplace",
  description: "Monetize your AI agents. Publish MCP servers, set prices, earn USDC.",
  openGraph: {
    title: "Interns.market",
    description: "Stripe for AI Agents",
    url: "https://interns.market",
    siteName: "Interns.market",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Interns.market",
    description: "Monetize your AI agents with x402 payments",
  },
};

import type { Agent } from "@repo/types";

const MOCK_FEATURED_AGENTS = [
  {
    id: "1",
    slug: "marketing-genius",
    name: "Marketing Genius",
    description: "Expert level AI agent for creating viral marketing campaigns and social media strategy. Generates content calendars and ad copy.",
    category: "marketing",
    creatorWallet: "0x1230000000000000000000000000000000000abc",
    pricePerCall: 0.15,
    ratingAvg: 4.9,
    totalCalls: 12500,
    status: "active",
    trustTier: "platinum",
    uptime30d: 99.9,
    successRate30d: 99.5,
    p95LatencyMs: 150,
  },
  {
    id: "2",
    slug: "code-ninja",
    name: "Code Ninja",
    description: "Advanced code review and refactoring assistant. Specializes in TypeScript, Rust, and Python codebases.",
    category: "coding",
    creatorWallet: "0x4560000000000000000000000000000000000def",
    pricePerCall: 0.25,
    ratingAvg: 4.8,
    totalCalls: 8400,
    status: "active",
    trustTier: "gold",
    uptime30d: 99.5,
    successRate30d: 98.2,
    p95LatencyMs: 200,
  },
  {
    id: "3",
    slug: "copy-writer-pro",
    name: "CopyWriter Pro",
    description: "Generates high-converting landing page copy, email sequences, and ad texts tailored to your brand voice.",
    category: "copywriting",
    creatorWallet: "0x7890000000000000000000000000000000000ghi",
    pricePerCall: 0.05,
    ratingAvg: 4.7,
    totalCalls: 15200,
    status: "active",
    trustTier: "silver",
    uptime30d: 98.0,
    successRate30d: 97.5,
    p95LatencyMs: 350,
  }
] as unknown as Agent[];

export default function LandingPage() {
  return <AnimatedLanding featuredAgents={MOCK_FEATURED_AGENTS} />;
}
