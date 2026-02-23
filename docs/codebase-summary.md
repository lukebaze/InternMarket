# InternMarket - Codebase Summary

## Project Structure

```
interns-market/ (pnpm Turborepo v2)
├── apps/
│   ├── web/              # Next.js 15 frontend + auth + agent CRUD API
│   │   ├── src/app/      # App Router pages & API routes
│   │   ├── src/components/
│   │   ├── src/lib/
│   │   └── package.json
│   ├── gateway/          # Cloudflare Workers MCP proxy + x402
│   │   ├── src/
│   │   │   ├── cron/     # health-check, metrics-aggregation, trust-recalc
│   │   │   ├── lib/      # json-rpc-parser, error-envelope, x402-config, x402-payment-config-resolver
│   │   │   ├── middleware/  # x402-gateway, rate-limiter
│   │   │   ├── routes/   # agent-info, agent-invoke, health
│   │   │   └── services/ # agent-lookup, metrics-collector, transaction-logger
│   │   └── package.json
│   └── reference-agents/ # Seed agents for marketplace demo
│       ├── shared/       # mcp-handler.ts (factory)
│       ├── echo/         # CF Worker: echoes input
│       ├── text-summarizer/  # CF Worker: summarizes text
│       └── code-formatter/   # CF Worker: formats code
├── packages/
│   ├── db/               # Drizzle ORM + schema (7 tables)
│   │   ├── src/schema/
│   │   ├── src/client.ts # Neon + pg Pool
│   │   └── package.json
│   ├── types/            # Shared TypeScript interfaces + enums
│   │   └── src/index.ts
│   └── tsconfig/         # 3 shared configs
├── scripts/
│   └── seed-marketplace.ts   # Seeds reference agents into DB
├── package.json          # Root workspace
├── pnpm-workspace.yaml
└── .env.example
```

## Workspace Dependencies

```
@repo/web              → @repo/db, @repo/types, @repo/tsconfig
@repo/gateway          → @repo/db, @repo/types, @repo/tsconfig
reference-agents/echo  → standalone CF Worker (no shared packages)
reference-agents/text-summarizer → standalone CF Worker
reference-agents/code-formatter  → standalone CF Worker
@repo/db               → @repo/types, @repo/tsconfig
@repo/types            → @repo/tsconfig
@repo/tsconfig (leaf)
scripts/               → @repo/db (direct import for seeding)
```

## File Inventory by Workspace

### apps/web (Next.js Frontend)
#### Auth & Core
| File | Purpose | LOC |
|---|---|---|
| src/app/layout.tsx | Root layout, providers | ~40 |
| src/app/(marketing)/page.tsx | Landing/home page | ~50 |
| src/app/api/nonce/route.ts | SIWE challenge endpoint | ~30 |
| src/app/api/auth/[...nextauth]/route.ts | NextAuth handler | ~60 |
| src/middleware.ts | Auth middleware (dashboard guard) | ~25 |
| src/components/auth/connect-wallet-button.tsx | RainbowKit wrapper | ~35 |
| src/components/auth/auth-provider.tsx | NextAuth + Wagmi provider | ~30 |
| src/lib/wagmi-config.ts | Wagmi config (chains, connectors) | ~40 |
| src/lib/auth.ts | SIWE message creation | ~25 |
| src/lib/slug-generator.ts | Slug generation with uniqueness check | ~30 |
| src/types/next-auth.d.ts | NextAuth type augmentation | ~20 |

#### Agent CRUD API (Phase 03)
| File | Purpose | LOC |
|---|---|---|
| src/app/api/agents/route.ts | POST /api/agents — create with MCP validation | ~80 |
| src/app/api/agents/[slug]/route.ts | GET/PUT/DELETE /api/agents/:slug | ~100 |
| src/app/api/mcp/validate/route.ts | MCP endpoint validation proxy | ~40 |
| src/lib/mcp-validator.ts | MCP tool discovery + validation logic | ~60 |
| src/lib/actions/agent-actions.ts | Agent server actions | ~70 |
| src/lib/actions/creator-actions.ts | Creator auto-create on first agent | ~40 |
| src/lib/actions/rating-actions.ts | Rating server actions | ~40 |
| src/lib/actions/dashboard-actions.ts | Dashboard stats server actions | ~50 |

#### UI Pages & Components
| File | Purpose |
|---|---|
| src/app/agents/page.tsx | Agent marketplace listing |
| src/app/agents/[slug]/page.tsx | Agent detail page |
| src/app/creators/[wallet]/page.tsx | Creator profile page |
| src/app/dashboard/page.tsx | Creator dashboard |
| src/app/dashboard/agents/page.tsx | My agents list |
| src/app/dashboard/agents/new/page.tsx | New agent form |
| src/app/dashboard/agents/[id]/edit/page.tsx | Edit agent form |
| src/app/dashboard/transactions/page.tsx | Transaction history |
| src/components/agents/agent-card.tsx | Agent card (trust badge, price, rating) |
| src/components/agents/agent-grid.tsx | Paginated agent grid |
| src/components/agents/agent-rating.tsx | Star rating display |
| src/components/agents/agent-search-bar.tsx | Search bar |
| src/components/agents/agent-tools-list.tsx | MCP tools display |
| src/components/agents/rating-form.tsx | Submit rating form |
| src/components/agents/verified-badge.tsx | Verified status badge |
| src/components/trust/trust-badge.tsx | Trust tier badge |
| src/components/trust/trust-score-display.tsx | Trust score numeric display |
| src/components/dashboard/agent-form.tsx | Create/edit agent form |
| src/components/dashboard/stats-overview.tsx | Dashboard stats cards |
| src/components/dashboard/transaction-table.tsx | Transaction table |
| src/components/dashboard/earnings-card.tsx | Earnings summary card |
| src/components/dashboard/use-mcp-validation.ts | MCP validation hook |
| src/components/creators/creator-profile-header.tsx | Creator header |
| src/components/creators/creator-agent-list.tsx | Creator's agent list |
| src/components/marketing/hero-section.tsx | Landing hero |
| src/components/marketing/animated-landing.tsx | Animated landing section |
| src/components/marketing/category-section.tsx | Category browsing |
| src/components/marketing/featured-section.tsx | Featured agents |
| src/components/marketing/how-it-works-section.tsx | How it works |

### apps/gateway (Cloudflare Workers)
| File | Purpose | LOC |
|---|---|---|
| src/index.ts | Hono app, CORS, slug routing, SSE passthrough | ~139 |
| src/lib/json-rpc-parser.ts | JSON-RPC 2.0 request parser | ~39 |
| src/lib/error-envelope.ts | Standardized error response builder | ~49 |
| src/lib/x402-config.ts | USDC contract addresses (Base Mainnet + Sepolia) | ~36 |
| src/lib/x402-payment-config-resolver.ts | Dynamic per-agent pricing resolver | ~52 |
| src/lib/payment-splitter.ts | Platform fee / creator payout split logic | ~30 |
| src/lib/trust-tier-thresholds.ts | Trust tier boundary constants | ~20 |
| src/lib/mcp-health-probe.ts | MCP endpoint health probe utility | ~25 |
| src/lib/db.ts | DB client for Workers environment | ~15 |
| src/middleware/x402-gateway.ts | x402 payment verification middleware | ~126 |
| src/middleware/rate-limiter.ts | Per-wallet rate limiting | ~30 |
| src/routes/agent-invoke.ts | MCP proxy route (POST /:slug) | ~113 |
| src/routes/agent-info.ts | Agent metadata route (GET /:slug) | ~40 |
| src/routes/health.ts | Health check route | ~15 |
| src/services/agent-lookup.ts | DB lookup by slug | ~34 |
| src/services/metrics-collector.ts | Request metrics recording | ~35 |
| src/services/transaction-logger.ts | Transaction + refund logging with retry | ~40 |
| src/cron/trust-recalc.ts | Hourly trust score recalculation | ~40 |
| src/cron/health-check.ts | 5-min agent health checks | ~35 |
| src/cron/metrics-aggregation.ts | Hourly metrics aggregation | ~35 |
| wrangler.toml | Workers config, bindings, cron triggers | ~25 |

### apps/reference-agents (Seed Agents)
| File | Purpose | LOC |
|---|---|---|
| shared/mcp-handler.ts | MCP handler factory (shared across agents) | ~60 |
| echo/src/index.ts | Echo agent — returns input as-is | ~40 |
| text-summarizer/src/index.ts | Text summarizer agent | ~60 |
| code-formatter/src/index.ts | Code formatter agent | ~60 |

### packages/db (Drizzle ORM)
| File | Purpose | LOC |
|---|---|---|
| src/schema/creators.ts | Creators table + types | ~16 |
| src/schema/agents.ts | Agents table + index | ~38 |
| src/schema/transactions.ts | Transactions table | ~20 |
| src/schema/ratings.ts | Ratings table | ~18 |
| src/schema/agent-metrics.ts | AgentMetrics table (time-series) | ~22 |
| src/schema/agent-showcase.ts | AgentShowcase table | ~16 |
| src/schema/relations.ts | Drizzle relationship definitions | ~15 |
| src/schema/index.ts | Export aggregator | ~7 |
| src/client.ts | Neon + pg Pool dual client | ~40 |
| src/index.ts | Main export | ~5 |
| drizzle.config.ts | Drizzle config for migrations | ~10 |

### packages/types (TypeScript)
| File | Purpose | LOC |
|---|---|---|
| src/index.ts | Enums + interfaces | ~106 |

### Key Dependencies by Workspace

#### apps/web
- **Framework:** next@15.1.7, react@19.2
- **Auth:** next-auth@5.0.0-beta, siwe@3.3
- **Wallet:** wagmi@2.19, rainbowkit@2.2, viem@2.46
- **UI:** tailwindcss@4, shadcn/ui (planned)
- **Data:** @tanstack/react-query@5.90

#### apps/gateway
- **Runtime:** hono@4, @cloudflare/workers-types
- **Payment:** @x402/hono (x402 middleware)
- **Utilities:** wrangler

#### packages/db
- **ORM:** drizzle-orm@0.45, drizzle-kit@0.45
- **Database:** postgres@17, neon@0.9 (serverless)
- **Utilities:** decimal.js (for precision)

#### packages/types
- **None** (pure TypeScript interfaces)

## Build Pipeline

```
Root (pnpm + Turbo)
├── build → compiles all workspaces
│   ├── @repo/tsconfig (no-op)
│   ├── @repo/types (tsc)
│   ├── @repo/db (tsc)
│   ├── @repo/web (next build)
│   └── @repo/gateway (wrangler build)
├── dev → concurrent dev servers
│   ├── @repo/web (next dev :3000)
│   └── @repo/gateway (wrangler dev :8787)
├── lint → ESLint all packages
├── type-check → tsc --noEmit
├── db:* → Drizzle migrations
└── seed → ts-node scripts/seed-marketplace.ts
```

## Reference Agents Deployment

Each reference agent is a standalone Cloudflare Workers app. Deploy individually:

```bash
cd apps/reference-agents/echo && wrangler deploy
cd apps/reference-agents/text-summarizer && wrangler deploy
cd apps/reference-agents/code-formatter && wrangler deploy
```

After deploy, run seed to register them in the marketplace DB:

```bash
pnpm seed
```

## Database Schema (7 Tables)

| Table | Columns | Relationships |
|---|---|---|
| creators | id, walletAddress*, displayName, avatarUrl, bio, totalRevenue | 1 → many agents |
| agents | id, slug*, creatorId→, name, description, category, mcpEndpoint, creatorWallet, pricePerCall, agentCard (JSONB), tools (JSONB), ratings, metrics, trust info | 1 → many transactions/ratings/metrics |
| transactions | id, agentId→, consumerWallet, amount, platformFee, creatorPayout, x402PaymentHash, status | n ← many |
| ratings | id, agentId→, userWallet, score, review | n ← many |
| agentMetrics | id, agentId→, timestamp, requests, latency, consumers (time-series) | n ← many |
| agentShowcase | id, agentId→, title, description, inputExample, outputExample, sortOrder | n ← many |
| relations | Drizzle foreign key definitions | - |

**Legend:** * = unique, → = foreign key

## Environment Variables

```bash
# Database (Neon)
DATABASE_URL=postgresql://user:pass@neon.host/db

# Authentication (Next.js)
NEXTAUTH_SECRET=random-secret
NEXTAUTH_URL=http://localhost:3000

# Blockchain (Wallet)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-project-id

# Gateway (Workers)
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8787

# Payment (x402)
PLATFORM_WALLET=0x...
X402_FACILITATOR_URL=https://facilitator.example.com

# Payment network (optional — gates testnet fallback)
TESTNET_ONLY=true   # Set to enable Base Sepolia fallback; omit for mainnet
```

## Development Workflow

1. **Install:** `pnpm install`
2. **Env setup:** Copy `.env.example` → `.env.local`
3. **DB setup:** `pnpm db:generate` → `pnpm db:migrate`
4. **Dev server:** `pnpm dev` (starts web + gateway)
5. **Type check:** `pnpm type-check`
6. **Lint:** `pnpm lint`

## Deployment Targets

| Workspace | Platform | Trigger | Notes |
|---|---|---|---|
| apps/web | Vercel | Git push main | Automatic |
| apps/gateway | Cloudflare Workers | Git push main | Via wrangler |
| packages/db | Neon | Manual migrations | Dev responsibility |

## Test Coverage

**Current:** ~0% (MVP focus on implementation; deferred to Phase 04-06 work)

**Planned:** Unit + integration tests for:
- Auth flow (SIWE signature verification)
- Agent CRUD API (ownership checks, MCP validation)
- x402 payment flow (payment verify, refund logging)
- Database queries (Drizzle schema validation)
- Trust scoring algorithm
- Reference agent MCP responses

## Security Considerations

- **SIWE:** Signature verification prevents unauthorized access
- **Middleware:** /dashboard route protected by NextAuth session
- **CORS:** Gateway allows cross-origin from web app
- **Secrets:** .env.local excluded from git (see .gitignore)
- **Chains:** Base Sepolia (testnet), Base (mainnet)
