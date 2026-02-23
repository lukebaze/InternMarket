# InternMarket - Codebase Summary

**Last Updated:** February 23, 2026 | **Files:** 146 | **Total LOC:** ~24,500

## Monorepo Structure (pnpm + Turborepo v2)

```
interns-market/
├── apps/
│   ├── web/                # Next.js 15 frontend + API routes (~3,200 LOC)
│   ├── gateway/            # Hono 4 edge API (Cloudflare Workers) (~850 LOC)
│   └── reference-agents/   # 3 bootstrap agents (CF Workers) (~225 LOC)
├── packages/
│   ├── db/                 # Drizzle ORM + Neon PostgreSQL (~400 LOC)
│   ├── types/              # Shared TypeScript interfaces (~150 LOC)
│   └── tsconfig/           # Shared TS configurations (~50 LOC)
├── scripts/
│   ├── seed-marketplace.ts # Auto-register reference agents
│   └── db-migrations.ts    # Drizzle migration runner
├── plans/                  # Development planning & research
├── docs/                   # Comprehensive documentation
└── .claude/                # Agent configuration & rules
```

## Workspace Dependencies

| Package | Depends On | Purpose |
|---------|-----------|---------|
| @repo/web | @repo/db, @repo/types | Frontend + API routes |
| @repo/gateway | @repo/db, @repo/types | Edge API gateway |
| @repo/reference-agents | @repo/types | Bootstrap agents |
| @repo/db | @repo/types | ORM + schema |
| @repo/types | (none) | Shared interfaces |
| @repo/tsconfig | (none) | TS configs |

## Core Packages

### apps/web (~3,200 LOC)

**Frontend (Next.js 15 App Router):**

Pages:
- `/` — Landing page + marketing
- `/agents` — Browse agents with filters
- `/agents/:slug` — Agent detail page
- `/creators/:wallet` — Creator profile (public)
- `/dashboard` — Creator dashboard (protected, auth required)
- `/docs` — Documentation & guides

**Components:**

| Component | Purpose |
|-----------|---------|
| AuthProvider | SIWE + NextAuth session context |
| ConnectWalletButton | RainbowKit wallet connection |
| AgentCard | Agent preview with trust badge |
| AgentGrid | Paginated agent listing |
| AgentSearchBar | Full-text search input |
| AgentRating | User review component |
| RatingForm | Submit review modal |
| VerifiedBadge | Trust tier indicator |

**API Routes:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/nonce | GET | No | Challenge for SIWE signing |
| /api/auth/[...nextauth] | POST | Yes | NextAuth callback |
| /api/agents | GET/POST | POST requires auth | List/create agents |
| /api/agents/:slug | GET/PUT/DELETE | PUT/DELETE require auth | Agent CRUD |
| /api/mcp/validate | POST | Yes | Validate MCP endpoint |

**Key Files:**
- `middleware.ts` — Protects /dashboard route
- `lib/auth.ts` — SIWE message creation
- `lib/wagmi-config.ts` — Wagmi + RainbowKit setup
- `components/dashboard/agent-form.tsx` — Agent creation form

### apps/gateway (~850 LOC)

**JSON-RPC 2.0 Edge Gateway (Hono 4 on Cloudflare Workers):**

**Core Services:**

| Service | File | Purpose |
|---------|------|---------|
| Agent Lookup | `agent-lookup.ts` | Resolves agent by slug from DB |
| Payment Config | `x402-payment-config-resolver.ts` | Looks up per-agent pricing |
| Error Envelope | `error-envelope.ts` | JSON-RPC standardized errors |
| JSON-RPC Parser | `json-rpc-parser.ts` | Validates RPC request format |
| Transaction Logger | `transaction-logger.ts` | Records x402 payment attempts |
| Metrics Collector | `metrics-collector.ts` | Aggregates call metrics (latency, success rate) |

**Middleware:**

| Middleware | File | Purpose |
|-----------|------|---------|
| Body Buffering | `middleware/body-buffer` | Fixes CF Workers double-read bug |
| Rate Limiter | `middleware/rate-limiter.ts` | Per-IP throttling (future) |
| x402 Gateway | `middleware/x402-gateway.ts` | Payment header validation |
| CORS | Built-in Hono | Cross-origin access control |

**Cron Jobs:**

| Job | File | Frequency | Purpose |
|----|------|-----------|---------|
| Health Check | `cron/health-check.ts` | Every 5 min | Probes agent endpoints |
| Metrics Agg | `cron/metrics-aggregation.ts` | Hourly | Rolls up 30-day stats |
| Trust Recalc | `cron/trust-recalc.ts` | Hourly | Updates trustScore & tier |

**Routes:**

| Route | Method | Purpose |
|-------|--------|---------|
| /health | GET | Service health check (version, timestamp) |
| /agents/:slug/invoke | POST | Call MCP agent (x402 required, JSON-RPC) |
| /agents/:slug | GET | Agent detail (cached) |
| /agents/:slug/info | GET | Full agent info including MCP tools |
| /agents | GET | List agents (paginated) |

### apps/reference-agents (~225 LOC)

**Three Cloudflare Workers agents** bootstrapping marketplace:

**echo** — Mirrors input unchanged
```
Method: tools/echo
Input: { message: string }
Output: { echoed: string, timestamp: ISO8601 }
Endpoint: https://echo-agent.workers.dev
```

**text-summarizer** — Summarizes text using simple NLP
```
Method: tools/summarize
Input: { text: string, maxLength?: number }
Output: { summary: string, originalLength: number }
Endpoint: https://text-summarizer-agent.workers.dev
```

**code-formatter** — Formats code (Prettier-like)
```
Method: tools/format
Input: { code: string, language: string }
Output: { formatted: string, changed: boolean }
Endpoint: https://code-formatter-agent.workers.dev
```

**Shared:**
- `shared/mcp-handler.ts` — Factory for MCP JSON-RPC responses
- `SKILLS.md` — ClawHub metadata per agent
- Seed script — Registers agents on platform

### packages/db (~400 LOC)

**Drizzle ORM Schema (7 tables on Neon PostgreSQL):**

| Table | Key Columns | Purpose |
|-------|------------|---------|
| creators | id, walletAddress (unique), displayName, bio, totalRevenue | Marketplace creators |
| agents | id, slug (unique), creatorId, name, description, category, mcpEndpoint, pricePerCall, agentCard (JSONB), tools (JSONB), trustScore, trustTier, status | MCP agent registry |
| transactions | id, agentId, consumerWallet, amount, platformFee, creatorPayout, x402PaymentHash, status | Payment records |
| ratings | id, agentId, userWallet, score (1-5), review | User reviews & trust signals |
| agentMetrics | id, agentId, timestamp, totalRequests, successfulRequests, avgLatencyMs, p95LatencyMs, uniqueConsumers | 30-day rolling metrics |
| agentShowcase | id, agentId, title, inputExample, outputExample, sortOrder | Demo examples |
| relations | Foreign key constraints | Referential integrity |

**Key Patterns:**
- Inferred types: `Agent`, `NewAgent`, `Creator`, etc. (zero manual duplication)
- Relationships: `creatorAgents`, `agentCreator` (one-to-many)
- Indices: `agents_creator_id_idx`, `agentMetrics(agentId, timestamp DESC)`

**Client Setup:**
- Neon serverless for edge (CF Workers)
- pg Pool for Node.js backend (connection pooling)

### packages/types (~150 LOC)

**Shared Enums:**
```typescript
type AgentCategory = 'marketing' | 'assistant' | 'coding' | 'trading' | 'social' | 'copywriting' | 'pm';
type TrustTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
type AgentStatus = 'active' | 'paused' | 'under_review';
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';
```

**Interfaces:**
```typescript
interface Agent { id, slug, creatorId, name, description, category, mcpEndpoint, pricePerCall, trustScore, trustTier, status, ... }
interface Creator { id, walletAddress, displayName, bio, totalRevenue, createdAt, updatedAt }
interface Transaction { id, agentId, consumerWallet, amount, platformFee, creatorPayout, x402PaymentHash, status, createdAt }
interface Rating { id, agentId, userWallet, score, review, createdAt }
interface MCPTool { name, description, inputSchema, outputSchema }
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.1.7 | Full-stack, App Router |
| Frontend | React | 19 | UI components |
| Styling | TailwindCSS | 4 | Utility CSS |
| Auth | SIWE | 3 | Sign-In with Ethereum |
| Session | NextAuth | 5β | Session management |
| Wallet | RainbowKit | 2.2 | Wallet UX |
| Ethereum | Wagmi | 2.19 | EVM client |
| Backend | Hono | 4 | Lightweight edge framework |
| Database | Drizzle ORM | 0.45 | Type-safe ORM |
| Database | Neon | serverless | PostgreSQL edge runtime |
| Package Mgr | pnpm | 10.25 | Monorepo package manager |
| Build Cache | Turborepo | 2 | Incremental builds |

## Build & Development Pipeline

### Development Scripts
```bash
pnpm dev               # Starts all dev servers + watchers
pnpm build             # Builds all workspaces (Turbo cache)
pnpm lint              # ESLint across workspaces
pnpm type-check        # TypeScript strict checking
pnpm db:generate       # Generate Drizzle migrations
pnpm db:migrate        # Apply migrations to Neon
pnpm db:studio         # Open Drizzle Studio UI
```

### Workspace-Specific
```bash
pnpm --filter @repo/web dev      # Just frontend
pnpm --filter @repo/gateway dev  # Just gateway
cd apps/reference-agents && wrangler dev  # Agents locally
```

### Production Deployment
```bash
# Frontend: Vercel (auto-deploy on git push to main)
# Gateway: wrangler publish (deploys to CF Workers)
# Database: Manual migration via pnpm db:migrate
```

## Code Organization

### File Naming
- **Files:** kebab-case (`.ts`, `.tsx`)
- **Directories:** kebab-case
- **Exports:** camelCase (functions), PascalCase (components/types)

### Size Limits
- **Code files:** <200 LOC (split if exceeded)
- **Components:** <150 LOC
- **Configuration:** <100 LOC

### Monorepo Imports
```typescript
// ✅ Correct
import { agents } from '@repo/db';
import type { Agent } from '@repo/types';

// ❌ Avoid relative paths
import { agents } from '../../../packages/db/src/schema';
```

## Error Handling & Logging

### JSON-RPC 2.0 Error Envelope
```json
{
  "jsonrpc": "2.0",
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": { "details": "..." }
  },
  "id": null
}
```

### Console Logging
```typescript
console.error('[moduleName:functionName]', error);  // Always prefix
```

## Security Practices

- [ ] Secrets in `.env.local`, never in code
- [ ] SIWE signature verification on auth endpoints
- [ ] Middleware guards /dashboard + admin routes
- [ ] SQL injection prevention (Drizzle escapes)
- [ ] XSS prevention (React auto-escapes)
- [ ] CORS configured (trust only needed origins)
- [ ] Environment validation on startup
- [ ] Rate limiting on public endpoints (future)

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Agent list p95 latency | <300ms | ~200ms (estimated) |
| Agent detail p95 latency | <500ms | ~250ms (estimated) |
| DB query p95 | <100ms | ~50ms (estimated) |
| First Contentful Paint | <2s | ~1.2s (estimated) |

## Testing Strategy (Phase 2+)

- Unit tests: vitest (services, utilities)
- Integration tests: supertest (API routes)
- E2E tests: Playwright (user flows)
- Target coverage: 70%+

## Documentation Files

| File | Purpose |
|------|---------|
| `spec.md` | Vision, features, payment flow, API endpoints |
| `project-overview-pdr.md` | Product requirements, goals, success criteria |
| `code-standards.md` | TypeScript, Next.js, Hono, Drizzle patterns |
| `system-architecture.md` | Data flows, auth flow, trust scoring, deployment |
| `project-roadmap.md` | Phase breakdown, timeline, metrics, vision |
| `design-guidelines.md` | UI kit, breakpoints, accessibility |
| `README.md` | Setup, common tasks, troubleshooting |

## Deployment Architecture

### Development
```
Local Workstation:
├─ Next.js (http://localhost:3000)
├─ Hono (http://localhost:8787)
├─ Reference agents (http://localhost:8788+)
└─ Neon (serverless PostgreSQL)
```

### Production
```
Vercel (Next.js)  +  Cloudflare Workers (Hono)  +  Neon (PostgreSQL)
├─ HTTPS only            ├─ Edge routing             ├─ Backups enabled
├─ Auto-deploy on push   ├─ Global distribution      └─ Connection pooling
└─ Environment secrets   └─ 99.9% uptime
```

## Phase 1b Completions

- [x] JSON-RPC 2.0 error envelope
- [x] Slug-based agent routing (replaces UUID)
- [x] Body buffer middleware (CF Workers fix)
- [x] SSE passthrough for streaming
- [x] x402 payment config resolver
- [x] USDC contract addresses (Base + Sepolia)
- [x] Transaction logging & DB retries
- [x] Agent CRUD API (POST/GET/PUT/DELETE)
- [x] Creator auto-creation on first registration
- [x] Reference agents (echo, text-summarizer, code-formatter)
- [x] Slug generator with uniqueness check
- [x] Seed marketplace script

## Known Limitations

### Phase 1b (Delivered)
- Agent endpoints require manual onboarding (no auto-discovery yet)
- Health checks don't auto-pause agents (Phase 3)
- Trust scores static (Phase 3 calculates automatically)
- No ratings UI (Phase 4)
- No search/filtering (Phase 2)

### Future (Phase 2+)
- [ ] Full-text search via PostgreSQL
- [ ] Creator analytics dashboard
- [ ] Health check automation
- [ ] Metrics aggregation pipeline
- [ ] Multi-chain support (Polygon, Arbitrum)
