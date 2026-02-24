import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Download, Package } from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { getAgentBySlug } from "@/lib/actions/agent-actions";
import { getAgentRatings } from "@/lib/actions/rating-actions";
import { AgentRating } from "@/components/agents/agent-rating";
import { RatingForm } from "@/components/agents/rating-form";
import { VerifiedBadge } from "@/components/agents/verified-badge";
import { TrustBadge } from "@/components/trust/trust-badge";
import { InstallCommand } from "@/components/agents/install-command";
import { ReadmePreview } from "@/components/agents/readme-preview";
import { truncateAddress, formatDownloads, formatPackageSize } from "@/lib/utils";
import type { TrustTier } from "@repo/types";

interface AgentDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: AgentDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const agent = await getAgentBySlug(slug);
  if (!agent) return { title: "Intern Not Found" };
  return {
    title: `${agent.name} — InternMarket`,
    description: agent.description,
  };
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
  const [agent, { userId }] = await Promise.all([getAgentBySlug(slug), auth()]);
  if (!agent) notFound();

  const reviews = await getAgentRatings(agent.id);
  const isAuthenticated = !!userId;
  const downloadUrl = `/api/agents/${agent.slug}/download`;

  return (
    <div className="px-12 py-8">
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
          <VerifiedBadge verificationStatus={agent.verificationStatus} />
        </div>
        <h1 className="font-ui text-2xl font-bold text-text-primary mb-2">{agent.name}</h1>
        <div className="flex items-center gap-4 mb-4">
          <AgentRating rating={agent.ratingAvg} ratingCount={agent.ratingCount} />
          <span className="font-mono text-xs text-text-muted">v{agent.currentVersion}</span>
          <span className="font-mono text-xs text-text-muted">{formatDownloads(agent.downloads ?? 0)} downloads</span>
        </div>
        <InstallCommand slug={agent.slug} version={agent.currentVersion} />
      </div>

      <div className="flex gap-8">
        {/* Main content */}
        <div className="flex-1 space-y-8">
          {/* Description */}
          <section>
            <h2 className="font-ui text-sm font-semibold text-text-secondary mb-2">Description</h2>
            <p className="font-mono text-sm text-text-tertiary leading-[1.6]">{agent.description}</p>
          </section>

          {/* Tags */}
          {agent.tags && agent.tags.length > 0 && (
            <section>
              <h2 className="font-ui text-sm font-semibold text-text-secondary mb-3">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {agent.tags.map((tag) => (
                  <span key={tag} className="inline-flex px-2 py-1 bg-bg-border font-mono text-[10px] text-text-secondary">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Readme */}
          <section>
            <h2 className="font-ui text-sm font-semibold text-text-secondary mb-3">Documentation</h2>
            <ReadmePreview html={agent.readmeHtml} />
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
                <Link href="/sign-in" className="text-lime underline">Sign in</Link>{" "}
                to leave a review.
              </div>
            )}

            {reviews.length === 0 ? (
              <p className="font-mono text-sm text-text-muted">No reviews yet. Be the first to rate this intern.</p>
            ) : (
              <div className="space-y-3">
                {reviews.map((r) => (
                  <div key={r.id} className="border border-bg-border bg-bg-surface p-4">
                    <div className="flex items-center justify-between mb-2">
                      <StarDisplay score={r.score} />
                      <span className="font-mono text-[10px] text-text-muted">
                        {truncateAddress(r.userId)}
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

        {/* Sidebar */}
        <div className="w-[360px] shrink-0 space-y-4">
          {/* Download card */}
          <div className="bg-bg-surface border border-bg-border p-5">
            <div className="flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-lime" />
              <span className="font-mono text-xs font-medium text-text-primary">v{agent.currentVersion}</span>
            </div>
            <div className="space-y-2 font-mono text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-text-tertiary">Total downloads</span>
                <span className="font-medium text-text-primary">{(agent.downloads ?? 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-tertiary">Package size</span>
                <span className="font-medium text-text-primary">{formatPackageSize(agent.packageSize ?? 0)}</span>
              </div>
            </div>
            <a
              href={downloadUrl}
              className="flex items-center justify-center gap-2 w-full bg-lime text-black font-mono text-xs font-semibold py-2.5 hover:brightness-110 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Download .internagent
            </a>
          </div>

          {/* Creator card */}
          <div className="bg-bg-surface border border-bg-border p-5">
            <p className="font-mono text-[10px] text-text-muted mb-2">Creator</p>
            <Link href={`/creators/${agent.creator?.clerkUserId ?? ""}`} className="group">
              <p className="font-mono text-sm font-medium text-text-primary group-hover:text-lime transition-colors">
                {agent.creator?.displayName ?? truncateAddress(agent.creator?.clerkUserId ?? "")}
              </p>
              <p className="font-mono text-[10px] text-text-muted mt-0.5">
                {truncateAddress(agent.creator?.clerkUserId ?? "")}
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
