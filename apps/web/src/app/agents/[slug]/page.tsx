import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { getAgentBySlug } from "@/lib/actions/agent-actions";
import { getAgentRatings } from "@/lib/actions/rating-actions";
import { AgentRating } from "@/components/agents/agent-rating";
import { AgentToolsList } from "@/components/agents/agent-tools-list";
import { RatingForm } from "@/components/agents/rating-form";
import { VerifiedBadge } from "@/components/agents/verified-badge";
import { TrustBadge } from "@/components/trust/trust-badge";
import { TrustScoreDisplay } from "@/components/trust/trust-score-display";
import { truncateAddress, formatUSDC } from "@/lib/utils";
import { buildAgentOgMetadata } from "@/lib/og-metadata";
import type { AgentTool, TrustTier } from "@repo/types";

interface AgentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return { title: "Agent Not Found" };
  return buildAgentOgMetadata({
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    category: agent.category,
    trustTier: agent.trustTier,
    trustScore: agent.trustScore,
    pricePerCall: agent.pricePerCall,
  });
}

function StarDisplay({ score }: { score: number }) {
  return (
    <span className="text-lime text-sm">
      {"★".repeat(score)}
      <span className="text-text-muted">{"★".repeat(5 - score)}</span>
    </span>
  );
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { slug } = await params;
  const [agent, session] = await Promise.all([getAgentBySlug(slug), auth()]);
  if (!agent) notFound();

  const reviews = await getAgentRatings(agent.id);
  const isAuthenticated = !!(session?.user as { address?: string })?.address;

  const tools = (agent.tools ?? []) as AgentTool[];
  const gatewayUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://gateway.interns.market"}/agents/${agent.slug}`;

  return (
    <div className="px-12 py-8">
      {/* Back link */}
      <Link href="/agents" className="inline-flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text-secondary mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </Link>

      {/* Hero header */}
      <div className="border-b border-bg-border pb-6 mb-8">
        <div className="flex flex-wrap items-center gap-2 mb-2">
          <span className="inline-flex px-2 py-1 bg-bg-border font-mono text-[9px] font-medium text-text-secondary capitalize">
            {agent.category}
          </span>
          <TrustBadge tier={agent.trustTier as TrustTier} />
          <VerifiedBadge totalCalls={agent.totalCalls} status={agent.status} trustTier={agent.trustTier} />
        </div>
        <h1 className="font-ui text-2xl font-bold text-text-primary mb-2">{agent.name}</h1>
        <div className="flex items-center gap-4">
          <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
          <TrustScoreDisplay score={agent.trustScore} tier={agent.trustTier as TrustTier} />
        </div>
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-8">
          {/* Description */}
          <section>
            <h2 className="font-ui text-sm font-semibold text-text-secondary mb-2">Description</h2>
            <p className="font-mono text-sm text-text-tertiary leading-[1.6]">{agent.description}</p>
          </section>

          {/* Tools */}
          {tools.length > 0 && (
            <section>
              <h2 className="font-ui text-sm font-semibold text-text-secondary mb-3">
                MCP Tools ({tools.length})
              </h2>
              <AgentToolsList tools={tools} />
            </section>
          )}

          {/* Performance metrics — prominent display */}
          <section>
            <h2 className="font-ui text-sm font-semibold text-text-secondary mb-3">Performance (30d)</h2>
            <div className="flex gap-4">
              <div className="flex-1 bg-bg-surface border border-bg-border p-4">
                <p className="font-mono text-[10px] text-text-muted mb-1">Uptime</p>
                <p className="font-ui text-2xl font-semibold text-lime">
                  {parseFloat(agent.uptime30d ?? "0").toFixed(1)}%
                </p>
              </div>
              <div className="flex-1 bg-bg-surface border border-bg-border p-4">
                <p className="font-mono text-[10px] text-text-muted mb-1">P95 Latency</p>
                <p className="font-ui text-2xl font-semibold text-text-primary">
                  {agent.p95LatencyMs}ms
                </p>
              </div>
              <div className="flex-1 bg-bg-surface border border-bg-border p-4">
                <p className="font-mono text-[10px] text-text-muted mb-1">Success Rate</p>
                <p className="font-ui text-2xl font-semibold text-lime">
                  {parseFloat(agent.successRate30d ?? "0").toFixed(1)}%
                </p>
              </div>
            </div>
          </section>

          {/* Reviews */}
          <section>
            <h2 className="font-ui text-sm font-semibold text-text-secondary mb-4">
              Reviews {reviews.length > 0 && <span className="text-text-muted font-normal">({reviews.length})</span>}
            </h2>

            {isAuthenticated && (
              <div className="mb-6 border border-bg-border bg-bg-surface p-5">
                <p className="font-mono text-sm font-medium text-text-primary mb-4">Leave a Review</p>
                <RatingForm agentId={agent.id} />
              </div>
            )}

            {!isAuthenticated && (
              <div className="mb-4 bg-bg-surface border border-bg-border p-4 font-mono text-sm text-text-tertiary">
                <Link href="/api/auth/signin" className="text-lime underline">
                  Connect your wallet
                </Link>{" "}
                to leave a review.
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="font-mono text-sm text-text-muted">No reviews yet. Be the first to rate this agent.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-bg-border bg-bg-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StarDisplay score={r.score} />
                      <span className="font-mono text-[10px] text-text-muted">
                        {truncateAddress(r.userWallet)}
                      </span>
                    </div>
                    {r.review && (
                      <p className="font-mono text-sm text-text-tertiary leading-relaxed">{r.review}</p>
                    )}
                    <p className="font-mono text-[10px] text-text-muted mt-2">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar (360px) */}
        <div className="w-[360px] shrink-0 space-y-4">
          {/* Pricing card */}
          <div className="bg-bg-surface border border-bg-border p-5">
            <p className="font-mono text-xs text-text-muted mb-1">Price per call</p>
            <p className="font-ui text-3xl font-bold text-lime">{formatUSDC(agent.pricePerCall)}</p>
            <p className="font-mono text-[10px] text-text-muted">USDC</p>
            <div className="mt-4 pt-4 border-t border-bg-border space-y-2 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Total calls</span>
                <span className="font-medium text-text-primary">{agent.totalCalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Unique consumers</span>
                <span className="font-medium text-text-primary">{(agent.uniqueConsumers30d ?? 0).toLocaleString()}</span>
              </div>
            </div>
            <button className="w-full mt-4 bg-lime text-black font-mono text-xs font-semibold py-2.5 hover:brightness-110 transition-all">
              Use This Agent
            </button>
          </div>

          {/* Gateway code snippet */}
          <div className="bg-bg-surface border border-bg-border p-4">
            <p className="font-mono text-[10px] text-text-muted mb-2">MCP Gateway endpoint</p>
            <code className="font-mono text-xs text-lime break-all">{gatewayUrl}</code>
            <p className="font-mono text-[10px] text-text-muted mt-2">
              Calls billed at <strong className="text-text-secondary">{formatUSDC(agent.pricePerCall)} USDC</strong> per request via x402.
            </p>
          </div>

          {/* Creator card */}
          <div className="bg-bg-surface border border-bg-border p-5">
            <p className="font-mono text-[10px] text-text-muted mb-2">Creator</p>
            <Link href={`/creators/${agent.creatorWallet}`} className="group">
              <p className="font-mono text-sm font-medium text-text-primary group-hover:text-lime transition-colors">
                {agent.creator?.displayName ?? truncateAddress(agent.creatorWallet)}
              </p>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                {truncateAddress(agent.creatorWallet)}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
