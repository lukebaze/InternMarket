# InternMarket - Codebase Summary

## Project Structure

```
interns-market/ (pnpm Turborepo v2)
├── apps/
│   ├── web/              # Next.js 15 frontend + auth
│   │   ├── src/app/      # App Router pages & routes
│   │   ├── src/components/
│   │   ├── src/lib/
│   │   └── package.json  # ~335 LOC across 10 files
│   └── gateway/          # Cloudflare Workers API
│       ├── src/
│       └── package.json  # ~54 LOC across 4 files
├── packages/
│   ├── db/               # Drizzle ORM + schema
│   │   ├── src/schema/   # 7 tables
│   │   ├── src/client.ts # Neon + pg Pool
│   │   └── package.json  # ~234 LOC
│   ├── types/            # Shared TypeScript
│   │   └── src/index.ts  # ~106 LOC
│   └── tsconfig/         # 3 shared configs
├── package.json          # Root workspace
├── pnpm-workspace.yaml
└── .env.example
```

## Workspace Dependencies

```
@repo/web     → @repo/db, @repo/types, @repo/tsconfig
@repo/gateway → @repo/db, @repo/types, @repo/tsconfig
@repo/db      → @repo/types, @repo/tsconfig
@repo/types   → @repo/tsconfig
@repo/tsconfig (leaf)
```

## File Inventory by Workspace

### apps/web (Next.js Frontend)
| File | Purpose | LOC |
|---|---|---|
| src/app/layout.tsx | Root layout, providers | ~40 |
| src/app/page.tsx | Landing/home page | ~50 |
| src/app/api/nonce/route.ts | SIWE challenge endpoint | ~30 |
| src/app/api/auth/[...nextauth]/route.ts | NextAuth handler | ~60 |
| src/middleware.ts | Auth middleware (dashboard guard) | ~25 |
| src/components/auth/connect-wallet-button.tsx | RainbowKit wrapper | ~35 |
| src/components/auth/auth-provider.tsx | NextAuth + Wagmi provider | ~30 |
| src/lib/wagmi-config.ts | Wagmi config (chains, connectors) | ~40 |
| src/lib/auth.ts | SIWE message creation | ~25 |
| src/types/next-auth.d.ts | NextAuth type augmentation | ~20 |

### apps/gateway (Cloudflare Workers)
| File | Purpose | LOC |
|---|---|---|
| src/index.ts | Hono app, CORS, /health route | ~18 |
| wrangler.toml | Workers config, bindings | ~20 |
| package.json | Dependencies | ~16 |

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
└── db:* → Drizzle migrations
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

**Current:** ~0% (Phase 1 focus on implementation)

**Planned:** Unit + integration tests for:
- Auth flow (SIWE signature verification)
- API routes (nonce generation, transaction recording)
- Database queries (Drizzle schema validation)
- Trust scoring algorithm

## Security Considerations

- **SIWE:** Signature verification prevents unauthorized access
- **Middleware:** /dashboard route protected by NextAuth session
- **CORS:** Gateway allows cross-origin from web app
- **Secrets:** .env.local excluded from git (see .gitignore)
- **Chains:** Base Sepolia (testnet), Base (mainnet)
