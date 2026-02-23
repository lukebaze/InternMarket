/**
 * Seed demo agents directly into the database for marketplace demo.
 * Idempotent: upserts creator and agents by unique constraints.
 *
 * Usage: npx tsx scripts/seed-demo-agents.ts
 * Requires: DATABASE_URL in .env.local
 */

import { config } from "dotenv";
import { resolve } from "path";
import { eq } from "drizzle-orm";
import { createNodeClient } from "../packages/db/src/client";
import { creators, agents } from "../packages/db/src/schema";

config({ path: resolve(process.cwd(), ".env.local") });

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set in .env.local");

const db = createNodeClient(DATABASE_URL);

// --- Original demo creator + agents ---

const DEMO_WALLET = "0xDEMO0000000000000000000000000000000000001";

const DEMO_AGENTS = [
  {
    slug: "demo-growth-marketer",
    name: "GrowthMarketer AI",
    description: "Analyzes market trends and generates data-driven marketing strategies. Produces audience segmentation reports, ad copy, and campaign plans.",
    category: "marketing",
    mcpEndpoint: "https://demo-growth-marketer.agents.demo",
    pricePerCall: "0.015000",
    trustTier: "verified",
    trustScore: "91.50",
    ratingAvg: "4.8",
    ratingCount: 247,
    totalCalls: 15320,
    uptime30d: "99.20",
    successRate30d: "97.80",
    p95LatencyMs: 820,
    uniqueConsumers30d: 89,
  },
  {
    slug: "demo-code-reviewer-pro",
    name: "CodeReviewer Pro",
    description: "Performs automated code reviews for TypeScript, Python, and Go. Flags security issues, code smells, and suggests performance improvements.",
    category: "coding",
    mcpEndpoint: "https://demo-code-reviewer.agents.demo",
    pricePerCall: "0.010000",
    trustTier: "verified",
    trustScore: "88.30",
    ratingAvg: "4.7",
    ratingCount: 183,
    totalCalls: 9840,
    uptime30d: "98.90",
    successRate30d: "96.50",
    p95LatencyMs: 1240,
    uniqueConsumers30d: 62,
  },
  {
    slug: "demo-copywrite-wizard",
    name: "CopyWrite Wizard",
    description: "Transforms rough ideas into polished marketing copy, blog posts, and product descriptions. Optimizes for SEO and conversion.",
    category: "copywriting",
    mcpEndpoint: "https://demo-copywrite-wizard.agents.demo",
    pricePerCall: "0.008000",
    trustTier: "trusted",
    trustScore: "79.60",
    ratingAvg: "4.5",
    ratingCount: 95,
    totalCalls: 4210,
    uptime30d: "97.50",
    successRate30d: "95.20",
    p95LatencyMs: 650,
    uniqueConsumers30d: 41,
  },
  {
    slug: "demo-assistant-nexus",
    name: "Assistant Nexus",
    description: "General-purpose AI assistant for scheduling, Q&A, document summarization, and task management. Integrates with calendars and notes.",
    category: "assistant",
    mcpEndpoint: "https://demo-assistant-nexus.agents.demo",
    pricePerCall: "0.003000",
    trustTier: "trusted",
    trustScore: "75.10",
    ratingAvg: "4.4",
    ratingCount: 412,
    totalCalls: 28900,
    uptime30d: "99.60",
    successRate30d: "98.10",
    p95LatencyMs: 380,
    uniqueConsumers30d: 156,
  },
  {
    slug: "demo-quant-trader",
    name: "QuantTrader Signal",
    description: "Generates crypto and equity trading signals using technical analysis. Includes RSI, MACD, Bollinger Bands, and sentiment scoring.",
    category: "trading",
    mcpEndpoint: "https://demo-quant-trader.agents.demo",
    pricePerCall: "0.025000",
    trustTier: "verified",
    trustScore: "93.80",
    ratingAvg: "4.9",
    ratingCount: 68,
    totalCalls: 3150,
    uptime30d: "99.90",
    successRate30d: "99.10",
    p95LatencyMs: 290,
    uniqueConsumers30d: 34,
  },
  {
    slug: "demo-pm-scrum-master",
    name: "PM ScrumMaster",
    description: "Automates sprint planning, writes user stories from feature briefs, and generates retrospective summaries for agile teams.",
    category: "pm",
    mcpEndpoint: "https://demo-pm-scrum-master.agents.demo",
    pricePerCall: "0.012000",
    trustTier: "trusted",
    trustScore: "81.40",
    ratingAvg: "4.6",
    ratingCount: 59,
    totalCalls: 2380,
    uptime30d: "98.30",
    successRate30d: "96.80",
    p95LatencyMs: 710,
    uniqueConsumers30d: 28,
  },
];

// --- SEO Labs creator + consumer-favorites agents ---

const SEO_LABS_WALLET = "0x7b2c4E9F1a3D8b5C6e0F2A1B9d8C7e4f";

const SEO_LABS_AGENTS = [
  {
    slug: "seo-optimizer-pro",
    name: "SEO Optimizer Pro",
    description: "Analyzes on-page SEO, generates optimized meta tags, keyword clusters, and structured data markup. Identifies technical SEO issues and provides actionable fixes to boost search rankings.",
    category: "marketing",
    mcpEndpoint: "https://agents.interns.market/seo-optimizer-pro",
    pricePerCall: "0.100000",
    trustTier: "gold",
    trustScore: "92.50",
    ratingAvg: "4.8",
    ratingCount: 312,
    totalCalls: 18450,
    uptime30d: "99.50",
    successRate30d: "98.20",
    p95LatencyMs: 750,
    uniqueConsumers30d: 104,
    tools: [
      { name: "analyze_page_seo", description: "Audit on-page SEO signals and return a scored report" },
      { name: "generate_meta_tags", description: "Generate optimized title, description, and OG tags" },
      { name: "keyword_cluster", description: "Group keyword list into semantic topic clusters" },
    ],
  },
  {
    slug: "content-writer-ai",
    name: "Content Writer AI",
    description: "Produces long-form blog posts, landing page copy, and product descriptions optimized for SEO and conversion. Adapts tone, style, and reading level to target audiences.",
    category: "copywriting",
    mcpEndpoint: "https://agents.interns.market/content-writer-ai",
    pricePerCall: "0.050000",
    trustTier: "silver",
    trustScore: "83.10",
    ratingAvg: "4.6",
    ratingCount: 198,
    totalCalls: 11220,
    uptime30d: "98.80",
    successRate30d: "97.30",
    p95LatencyMs: 920,
    uniqueConsumers30d: 87,
    tools: [
      { name: "write_blog_post", description: "Generate a full SEO-optimized blog post from a topic brief" },
      { name: "rewrite_for_tone", description: "Rewrite copy to match a specified tone (formal, casual, etc.)" },
      { name: "generate_outline", description: "Create a structured content outline from a keyword" },
    ],
  },
  {
    slug: "code-review-bot",
    name: "Code Review Bot",
    description: "Performs deep static analysis and AI-powered code reviews for TypeScript, Python, Go, and Rust. Detects security vulnerabilities, suggests refactors, and enforces best practices.",
    category: "coding",
    mcpEndpoint: "https://agents.interns.market/code-review-bot",
    pricePerCall: "0.150000",
    trustTier: "platinum",
    trustScore: "95.80",
    ratingAvg: "4.9",
    ratingCount: 145,
    totalCalls: 7830,
    uptime30d: "99.90",
    successRate30d: "99.20",
    p95LatencyMs: 1100,
    uniqueConsumers30d: 63,
    tools: [
      { name: "review_pull_request", description: "Analyze a PR diff and return structured review comments" },
      { name: "detect_security_issues", description: "Scan code for OWASP top-10 vulnerabilities" },
      { name: "suggest_refactor", description: "Propose performance and readability improvements" },
    ],
  },
  {
    slug: "trade-analyzer",
    name: "Trade Analyzer",
    description: "Delivers real-time crypto and equity trade signals using RSI, MACD, order-book depth, and on-chain sentiment. Generates entry/exit recommendations with risk-adjusted position sizing.",
    category: "trading",
    mcpEndpoint: "https://agents.interns.market/trade-analyzer",
    pricePerCall: "0.080000",
    trustTier: "gold",
    trustScore: "90.20",
    ratingAvg: "4.7",
    ratingCount: 89,
    totalCalls: 4560,
    uptime30d: "99.80",
    successRate30d: "98.60",
    p95LatencyMs: 310,
    uniqueConsumers30d: 41,
    tools: [
      { name: "get_trade_signal", description: "Return a buy/sell/hold signal for a given ticker" },
      { name: "analyze_technicals", description: "Compute RSI, MACD, Bollinger Bands for a symbol" },
      { name: "size_position", description: "Calculate risk-adjusted position size given account balance" },
    ],
  },
  {
    slug: "social-media-agent",
    name: "Social Media Agent",
    description: "Schedules, drafts, and optimizes social media content across Twitter/X, LinkedIn, and Instagram. Generates hashtag strategies, engagement hooks, and thread structures.",
    category: "social",
    mcpEndpoint: "https://agents.interns.market/social-media-agent",
    pricePerCall: "0.030000",
    trustTier: "silver",
    trustScore: "78.40",
    ratingAvg: "4.5",
    ratingCount: 267,
    totalCalls: 21340,
    uptime30d: "98.50",
    successRate30d: "96.90",
    p95LatencyMs: 480,
    uniqueConsumers30d: 132,
    tools: [
      { name: "draft_post", description: "Generate platform-optimized post copy with hashtags" },
      { name: "create_thread", description: "Break a topic into an engaging Twitter/X thread" },
      { name: "suggest_schedule", description: "Recommend optimal posting times based on audience" },
    ],
  },
  {
    slug: "data-scraper-pro",
    name: "Data Scraper Pro",
    description: "Extracts structured data from websites, APIs, and PDFs at scale. Handles dynamic JavaScript pages, pagination, and rate limiting. Returns clean JSON or CSV output.",
    category: "assistant",
    mcpEndpoint: "https://agents.interns.market/data-scraper-pro",
    pricePerCall: "0.080000",
    trustTier: "gold",
    trustScore: "87.60",
    ratingAvg: "4.6",
    ratingCount: 176,
    totalCalls: 9980,
    uptime30d: "99.10",
    successRate30d: "97.50",
    p95LatencyMs: 1350,
    uniqueConsumers30d: 78,
    tools: [
      { name: "scrape_url", description: "Extract structured data from a URL using CSS selectors" },
      { name: "scrape_paginated", description: "Crawl multi-page results and merge into a single dataset" },
      { name: "parse_pdf", description: "Extract tables and text content from a PDF document" },
    ],
  },
];

async function seedOriginalDemoData(walletAddress: string) {
  // Upsert original demo creator (do nothing if wallet already exists)
  const [creator] = await db
    .insert(creators)
    .values({
      walletAddress,
      displayName: "InternMarket Demo",
      bio: "Official demo agents for InternMarket marketplace.",
    })
    .onConflictDoNothing({ target: creators.walletAddress })
    .returning();

  if (!creator) {
    // Already exists — look up existing
    const [existing] = await db
      .select()
      .from(creators)
      .where(eq(creators.walletAddress, walletAddress))
      .limit(1);
    console.log(`Creator already exists: ${existing.id} (${walletAddress})`);
    return existing;
  }

  console.log(`Created creator: ${creator.id} (${walletAddress})`);

  for (const agent of DEMO_AGENTS) {
    await db
      .insert(agents)
      .values({
        ...agent,
        creatorId: creator.id,
        creatorWallet: walletAddress,
        status: "active",
      })
      .onConflictDoNothing({ target: agents.slug });
    console.log(`  + ${agent.name} [${agent.category}]`);
  }

  return creator;
}

async function seedSeoLabsData(walletAddress: string) {
  // Upsert SEO Labs creator
  const [creator] = await db
    .insert(creators)
    .values({
      walletAddress,
      displayName: "SEO Labs",
      bio: "Building AI-powered SEO tools for the modern web.",
    })
    .onConflictDoNothing({ target: creators.walletAddress })
    .returning();

  let creatorRecord = creator;

  if (!creatorRecord) {
    const [existing] = await db
      .select()
      .from(creators)
      .where(eq(creators.walletAddress, walletAddress))
      .limit(1);
    console.log(`SEO Labs creator already exists: ${existing.id}`);
    creatorRecord = existing;
  } else {
    console.log(`Created SEO Labs creator: ${creatorRecord.id}`);
  }

  for (const agent of SEO_LABS_AGENTS) {
    const { tools: agentTools, ...agentData } = agent;
    await db
      .insert(agents)
      .values({
        ...agentData,
        tools: agentTools,
        creatorId: creatorRecord.id,
        creatorWallet: walletAddress,
        status: "active",
      })
      .onConflictDoNothing({ target: agents.slug });
    console.log(`  + ${agent.name} [${agent.category}]`);
  }
}

async function main() {
  console.log("Seeding original demo agents...");
  await seedOriginalDemoData(DEMO_WALLET);

  console.log("\nSeeding SEO Labs agents...");
  await seedSeoLabsData(SEO_LABS_WALLET);

  console.log("\nVerifying inserted data...");
  const allAgents = await db
    .select({ slug: agents.slug, name: agents.name, category: agents.category, trustTier: agents.trustTier })
    .from(agents);

  console.log(`\nTotal agents in DB: ${allAgents.length}`);
  for (const a of allAgents) {
    console.log(`  [${a.trustTier}] ${a.slug} — ${a.name} (${a.category})`);
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
