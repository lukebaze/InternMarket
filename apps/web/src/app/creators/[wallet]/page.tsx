import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCreatorProfile } from "@/lib/actions/creator-actions";
import { CreatorProfileHeader } from "@/components/creators/creator-profile-header";
import { CreatorAgentList } from "@/components/creators/creator-agent-list";

interface CreatorPageProps {
  params: Promise<{ wallet: string }>;
}

export async function generateMetadata({ params }: CreatorPageProps): Promise<Metadata> {
  const { wallet } = await params;
  const profile = await getCreatorProfile(wallet);
  if (!profile) return { title: "Creator Not Found" };
  return {
    title: `${profile.creator.displayName ?? wallet} — InternMarket`,
    description: profile.creator.bio ?? `${profile.aggregates.totalAgents} agents published`,
  };
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
        clerkUserId={creator.clerkUserId}
        bio={creator.bio}
        totalAgents={aggregates.totalAgents}
        totalDownloads={aggregates.totalDownloads}
        avgRating={aggregates.avgRating}
      />

      <CreatorAgentList agents={agents as unknown as import("@repo/types").Agent[]} />
    </div>
  );
}
