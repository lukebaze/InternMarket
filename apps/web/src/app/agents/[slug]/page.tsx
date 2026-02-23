import { notFound } from "next/navigation";
import Link from "next/link";
import { getAgentBySlug } from "@/lib/actions/agent-actions";
import { AgentRating } from "@/components/agents/agent-rating";
import { AgentToolsList } from "@/components/agents/agent-tools-list";
import { TrustBadge } from "@/components/trust/trust-badge";
import { TrustScoreDisplay } from "@/components/trust/trust-score-display";
import { truncateAddress, formatUSDC } from "@/lib/utils";
import type { AgentTool, TrustTier } from "@repo/types";

interface AgentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function AgentDetailPage({ params }: AgentDetailPageProps) {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) notFound();

  const tools = (agent.tools ?? []) as AgentTool[];
  const gatewayUrl = `${process.env.NEXT_PUBLIC_GATEWAY_URL ?? "https://gateway.interns.market"}/agents/${agent.slug}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Back */}
      <Link href="/agents" className="text-sm text-gray-500 hover:text-gray-900 mb-6 inline-flex items-center gap-1">
        ← Back to agents
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                {agent.category}
              </span>
              <TrustBadge tier={agent.trustTier as TrustTier} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{agent.name}</h1>
            <div className="flex items-center gap-4">
              <AgentRating rating={agent.ratingAvg} totalCalls={agent.totalCalls} />
              <TrustScoreDisplay score={agent.trustScore} tier={agent.trustTier as TrustTier} />
            </div>
          </div>

          {/* Description */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{agent.description}</p>
          </section>

          {/* Tools */}
          {tools.length > 0 && (
            <section>
              <h2 className="text-base font-semibold text-gray-900 mb-3">
                Available Tools ({tools.length})
              </h2>
              <AgentToolsList tools={tools} />
            </section>
          )}

          {/* Gateway usage */}
          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Use This Agent</h2>
            <div className="rounded-lg bg-gray-950 p-4">
              <p className="text-xs text-gray-400 mb-2">MCP Gateway endpoint</p>
              <code className="text-xs text-green-400 break-all">{gatewayUrl}</code>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Calls are billed at{" "}
              <strong className="text-gray-600">{formatUSDC(agent.pricePerCall)} USDC</strong> per
              request via the x402 payment protocol.
            </p>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Pricing card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-500 mb-1">Price per call</p>
            <p className="text-3xl font-bold text-gray-900">{formatUSDC(agent.pricePerCall)}</p>
            <p className="text-xs text-gray-400">USDC</p>
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-2 text-xs text-gray-500">
              <div className="flex justify-between">
                <span>Total calls</span>
                <span className="font-medium text-gray-900">{agent.totalCalls.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Uptime (30d)</span>
                <span className="font-medium text-gray-900">{parseFloat(agent.uptime30d).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Success rate</span>
                <span className="font-medium text-gray-900">{parseFloat(agent.successRate30d).toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>P95 latency</span>
                <span className="font-medium text-gray-900">{agent.p95LatencyMs}ms</span>
              </div>
            </div>
          </div>

          {/* Creator card */}
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <p className="text-xs text-gray-500 mb-2">Creator</p>
            <p className="text-sm font-medium text-gray-900">
              {agent.creator?.displayName ?? truncateAddress(agent.creatorWallet)}
            </p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">
              {truncateAddress(agent.creatorWallet)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
