/**
 * Seed marketplace with reference agents.
 * Registers all 3 reference agents via POST /api/agents.
 *
 * Usage: pnpm tsx scripts/seed-marketplace.ts
 *
 * Requires:
 * - Web app running on localhost:3000 (or set API_URL env var)
 * - Valid auth cookie/token (set AUTH_COOKIE env var)
 * - Reference agents deployed (set their endpoints via env or defaults)
 */

const API_URL = process.env.API_URL ?? "http://localhost:3000";
const AUTH_COOKIE = process.env.AUTH_COOKIE ?? "";

interface AgentSeed {
  name: string;
  endpoint: string;
  category: string;
  pricePerCall: string;
  description: string;
}

const AGENTS: AgentSeed[] = [
  {
    name: "Echo Agent",
    endpoint: process.env.ECHO_URL ?? "https://interns-echo-agent.workers.dev",
    category: "assistant",
    pricePerCall: "0.001",
    description: "Echoes input back. Test agent for InternMarket connectivity and x402 payment flow.",
  },
  {
    name: "Text Summarizer",
    endpoint: process.env.SUMMARIZER_URL ?? "https://interns-text-summarizer.workers.dev",
    category: "copywriting",
    pricePerCall: "0.005",
    description: "Extracts key sentences from text using word frequency scoring. No LLM dependency.",
  },
  {
    name: "Code Formatter",
    endpoint: process.env.FORMATTER_URL ?? "https://interns-code-formatter.workers.dev",
    category: "coding",
    pricePerCall: "0.003",
    description: "Formats JSON or TypeScript code with proper indentation.",
  },
];

async function seedAgent(agent: AgentSeed) {
  console.log(`Registering: ${agent.name} → ${agent.endpoint}`);

  const res = await fetch(`${API_URL}/api/agents`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(AUTH_COOKIE ? { Cookie: AUTH_COOKIE } : {}),
    },
    body: JSON.stringify(agent),
  });

  const data = await res.json();

  if (res.ok) {
    console.log(`  OK: slug=${data.agent?.slug}, id=${data.agent?.id}`);
  } else {
    console.error(`  FAILED (${res.status}): ${data.error ?? JSON.stringify(data)}`);
  }

  return { name: agent.name, status: res.status, data };
}

async function main() {
  console.log(`Seeding marketplace at ${API_URL}\n`);

  const results = [];
  for (const agent of AGENTS) {
    results.push(await seedAgent(agent));
  }

  console.log("\nSummary:");
  for (const r of results) {
    console.log(`  ${r.status === 201 ? "+" : "x"} ${r.name} → ${r.status}`);
  }
}

main().catch(console.error);
