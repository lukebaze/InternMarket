import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCreatorProfile } from "@/lib/actions/creator-actions";
import { buildCreatorOgMetadata } from "@/lib/og-metadata";
import { CreatorProfileHeader } from "@/components/creators/creator-profile-header";
import { CreatorAgentList } from "@/components/creators/creator-agent-list";

interface CreatorPageProps {
  params: Promise<{ wallet: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { wallet } = await params;
  const profile = await getCreatorProfile(wallet);
  if (!profile) return { title: "Creator Not Found" };
  return buildCreatorOgMetadata({
    displayName: profile.creator.displayName,
    walletAddress: profile.creator.walletAddress,
    totalAgents: profile.aggregates.totalAgents,
    totalCalls: profile.aggregates.totalCalls,
    avgTrustScore: profile.aggregates.avgTrustScore,
  });
}

export default async function CreatorProfilePage({ params }: CreatorPageProps) {
  const { wallet } = await params;
  const profile = await getCreatorProfile(wallet);
  if (!profile) notFound();

  const { creator, agents, aggregates } = profile;

  return (
    <div className="px-12 py-8">
      <Link
        href="/agents"
        className="inline-flex items-center gap-2 font-mono text-xs text-text-muted hover:text-text-secondary mb-5"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Catalog
      </Link>

      <CreatorProfileHeader
        displayName={creator.displayName}
        walletAddress={creator.walletAddress}
        bio={creator.bio}
        totalAgents={aggregates.totalAgents}
        totalCalls={aggregates.totalCalls}
        totalRevenue={creator.totalRevenue}
        avgTrustScore={aggregates.avgTrustScore}
      />

      <CreatorAgentList agents={agents} />
    </div>
  );
}
