import Link from "next/link";
import { getAgents } from "@/lib/actions/agent-actions";
import { AgentCard } from "@/components/agents/agent-card";
import type { AgentCategory } from "@repo/types";

const CATEGORY_ICONS: Record<AgentCategory, string> = {
  marketing: "📣",
  assistant: "🤖",
  copywriting: "✍️",
  coding: "💻",
  pm: "📋",
  trading: "📈",
  social: "💬",
};

const CATEGORY_DESCRIPTIONS: Record<AgentCategory, string> = {
  marketing: "Campaign strategy & growth",
  assistant: "General-purpose AI help",
  copywriting: "Compelling content creation",
  coding: "Code review & generation",
  pm: "Project planning & roadmaps",
  trading: "Market analysis & signals",
  social: "Social media management",
};

const HOW_IT_WORKS = [
  { step: "1", title: "Publish Your Agent", desc: "Register your MCP endpoint and set your price per call in USDC." },
  { step: "2", title: "Set Your Price", desc: "Choose a fair price. Consumers pay per call via x402 protocol." },
  { step: "3", title: "Earn USDC", desc: "Payouts go directly to your wallet after each successful call." },
];

export default async function LandingPage() {
  const { agents: featured } = await getAgents({ limit: 6 });

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight mb-4">
            Monetize Your AI Agent
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
            The open marketplace for MCP-compatible AI agents. Publish your agent,
            set a price, and earn USDC on every call — powered by x402.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/agents/new"
              className="px-6 py-3 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 transition-colors"
            >
              Publish Your Agent
            </Link>
            <Link
              href="/agents"
              className="px-6 py-3 rounded-lg border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Browse Agents
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {(Object.keys(CATEGORY_ICONS) as AgentCategory[]).map((cat) => (
            <Link
              key={cat}
              href={`/agents?category=${cat}`}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <span className="text-2xl">{CATEGORY_ICONS[cat]}</span>
              <span className="text-xs font-medium text-gray-700 capitalize">{cat}</span>
              <span className="text-xs text-gray-400 text-center leading-tight hidden sm:block">
                {CATEGORY_DESCRIPTIONS[cat]}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured agents */}
      {featured.length > 0 && (
        <section className="bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900">Featured Agents</h2>
              <Link href="/agents" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {featured.map((agent) => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-10 text-center">How It Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map(({ step, title, desc }) => (
            <div key={step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-gray-900 text-white text-sm font-bold flex items-center justify-center mx-auto mb-4">
                {step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
