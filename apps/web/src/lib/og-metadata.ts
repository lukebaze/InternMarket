import type { Metadata } from "next";

const SITE_NAME = "Interns.market";
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://interns.market";

interface AgentOgInput {
  name: string;
  slug: string;
  description: string;
  category: string;
  trustTier: string;
  trustScore: number | string;
  pricePerCall: string;
}

/** Build OG metadata for an agent detail page */
export function buildAgentOgMetadata(agent: AgentOgInput): Metadata {
  const price = parseFloat(agent.pricePerCall);
  const priceStr = isNaN(price) ? "$0.00" : `$${price.toFixed(2)}`;
  const score = typeof agent.trustScore === "string" ? parseFloat(agent.trustScore) : agent.trustScore;
  const desc = `${agent.trustTier.charAt(0).toUpperCase() + agent.trustTier.slice(1)} tier agent (trust: ${score.toFixed(1)}) | ${priceStr}/call | ${agent.category}`;
  const title = `${agent.name} — ${SITE_NAME}`;
  const url = `${BASE_URL}/agents/${agent.slug}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

interface CreatorOgInput {
  displayName: string | null;
  walletAddress: string;
  totalAgents: number;
  totalCalls: number;
  avgTrustScore: number;
}

/** Build OG metadata for a creator profile page */
export function buildCreatorOgMetadata(creator: CreatorOgInput): Metadata {
  const name = creator.displayName ?? `${creator.walletAddress.slice(0, 6)}...${creator.walletAddress.slice(-4)}`;
  const title = `${name} — Creator on ${SITE_NAME}`;
  const desc = `${creator.totalAgents} agents | ${creator.totalCalls.toLocaleString()} total calls | Avg trust: ${creator.avgTrustScore.toFixed(1)}`;
  const url = `${BASE_URL}/creators/${creator.walletAddress}`;

  return {
    title,
    description: desc,
    openGraph: {
      title,
      description: desc,
      url,
      siteName: SITE_NAME,
      type: "profile",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}
