import { Suspense } from "react";
import type { AgentCategory, TrustTier } from "@repo/types";
import { getAgents } from "@/lib/actions/agent-actions";
import type { SortOption } from "@/lib/actions/agent-actions";
import { AgentGrid, AgentGridSkeleton } from "@/components/agents/agent-grid";
import { AgentSearchBar } from "@/components/agents/agent-search-bar";

interface AgentCatalogPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    tier?: string;
    priceMin?: string;
    priceMax?: string;
    sort?: string;
    cursor?: string;
  }>;
}

async function AgentResults({ search, category, trustTier, priceMin, priceMax, sort }: {
  search?: string;
  category?: AgentCategory;
  trustTier?: TrustTier[];
  priceMin?: string;
  priceMax?: string;
  sort?: SortOption;
}) {
  const { agents, nextCursor } = await getAgents({
    search, category, trustTier, priceMin, priceMax, sort, limit: 12,
  });
  return <AgentGrid agents={agents} nextCursor={nextCursor} />;
}

export default async function AgentCatalogPage({ searchParams }: AgentCatalogPageProps) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category as AgentCategory | undefined;
  const trustTier = params.tier?.split(",").filter(Boolean) as TrustTier[] | undefined;
  const sort = (params.sort as SortOption) || undefined;

  return (
    <div className="px-12 py-8">
      <div className="mb-6">
        <h1 className="font-ui text-2xl font-bold text-text-primary mb-1">Browse Agents</h1>
        <p className="font-mono text-sm text-text-tertiary">Discover AI agents for every use case</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <AgentSearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<AgentGridSkeleton />}>
        <AgentResults
          search={search}
          category={category}
          trustTier={trustTier}
          priceMin={params.priceMin}
          priceMax={params.priceMax}
          sort={sort}
        />
      </Suspense>
    </div>
  );
}
