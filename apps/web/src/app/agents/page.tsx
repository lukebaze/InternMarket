import { Suspense } from "react";
import type { AgentCategory } from "@repo/types";
import { getAgents } from "@/lib/actions/agent-actions";
import { AgentGrid, AgentGridSkeleton } from "@/components/agents/agent-grid";
import { AgentSearchBar } from "@/components/agents/agent-search-bar";

interface AgentCatalogPageProps {
  searchParams: Promise<{ search?: string; category?: string }>;
}

async function AgentResults({ search, category }: { search?: string; category?: AgentCategory }) {
  const { agents } = await getAgents({ search, category, limit: 12 });
  return <AgentGrid agents={agents} />;
}

export default async function AgentCatalogPage({ searchParams }: AgentCatalogPageProps) {
  const params = await searchParams;
  const search = params.search;
  const category = params.category as AgentCategory | undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Browse Agents</h1>
        <p className="text-sm text-gray-500">Discover AI agents for every use case</p>
      </div>

      <div className="mb-6">
        <Suspense fallback={null}>
          <AgentSearchBar />
        </Suspense>
      </div>

      <Suspense fallback={<AgentGridSkeleton />}>
        <AgentResults search={search} category={category} />
      </Suspense>
    </div>
  );
}
