# InternMarket - Codebase Summary

**Last Updated:** February 24, 2026 | **Files:** 152 | **Total LOC:** ~26,800

## Monorepo Structure (pnpm + Turborepo v2)

```
interns-market/
├── apps/
│   └── web/                # Next.js 15 + React 19 + API routes (~4,200 LOC)
│       ├── src/app/        # App Router pages + API routes
│       ├── src/components/ # React components (marketing, ui, agents, etc)
│       └── src/lib/        # Utilities (auth, R2, validation)
├── packages/
│   ├── db/                 # Drizzle ORM + Neon PostgreSQL (~450 LOC)
│   ├── types/              # Shared TypeScript interfaces (~200 LOC)
│   ├── cli/                # CLI client package (~1,200 LOC)
│   └── tsconfig/           # Shared TS configurations (~50 LOC)
├── plans/                  # Development planning & research
├── docs/                   # Comprehensive documentation
└── .claude/                # Agent configuration & rules
```

## Workspace Dependencies

| Package | Depends On | Purpose |
|---------|-----------|---------|
| @repo/web | @repo/db, @repo/types | Frontend + API routes |
| @repo/cli | @repo/types | CLI client for package management |
| @repo/db | @repo/types | ORM + schema |
| @repo/types | (none) | Shared interfaces |
| @repo/tsconfig | (none) | TS configs |

## Core Packages

### apps/web (~4,200 LOC)

**Frontend (Next.js 15 App Router):**

Pages:
- `/` — Landing page with 7 marketing sections
- `/agents` — Browse agents with filters & search
- `/agents/:slug` — Agent detail page + downloads/versions
- `/creators/:wallet` — Creator profile (public)
- `/dashboard` — Creator dashboard (protected)
- `/consumer` — Consumer home + favorites & settings
- `/docs` — Documentation & guides

**Components:**

*Marketing (9 files, 721 LOC)*
- `animated-landing.tsx` — Composes all 7 sections
- `hero-section.tsx` — Gradient headline, terminal animation, CTAs, trust bar
- `problem-section.tsx` — 3 pain-point cards
- `buyers-section.tsx` — Terminal demo, 4 benefits, category strip
- `creators-section.tsx` — Stats, 4-step process, monetization
- `security-section.tsx` — 4 trust pillars
- `social-proof-section.tsx` — Testimonials, waitlist, CTAs
- `terminal-animation.tsx` — Typewriter effect
- `category-section.tsx` — Category pills with counts
- `motion-variants.ts` — Shared Framer Motion animations

*UI Library (8 files, 603 LOC, shadcn/ui)*
- Badge, Button, Card, Dialog, Input, Skeleton, Table, Tabs

*Agents/Rating*
- AgentCard, AgentRating, AgentSearchBar, VerifiedBadge
- InstallCommand, ReadmePreview, DownloadStatsCard, VersionTable

**API Routes:**

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/nonce | GET | No | Challenge for SIWE signing |
| /api/auth/[...nextauth] | POST | Yes | NextAuth callback |
| /api/agents | GET/POST | POST requires auth | List/create agents |
| /api/agents/:slug | GET/PUT/DELETE | PUT/DELETE require auth | Agent CRUD |
| /api/agents/:slug/download | GET | No | Download agent package |
| /api/agents/:slug/versions | GET | No | List agent versions |
| /api/search | GET | No | Full-text search agents |
| /api/upload/presigned | POST | Yes | Get R2 presigned URL |
| /api/ratings | GET/POST | POST requires auth | Read/submit ratings |

**Key Files:**
- `middleware.ts` — Protects /dashboard route
- `lib/auth.ts` — SIWE message creation
- `lib/r2/` — Cloudflare R2 client & operations
- `lib/package-validator.ts` — NPM package validation
- `components/dashboard/agent-form.tsx` — Agent creation form

### packages/cli (~1,200 LOC)

**CLI Client for Agent Package Management:**

Commands:
- `publish` — Deploy agent to marketplace
- `install` — Install agent locally
- `uninstall` — Remove installed agent
- `update` — Update agent to latest version
- `list` — Show installed agents
- `login` — Authenticate with wallet
- `logout` — Clear authentication
- `analytics` — View agent performance metrics
- `init` — Initialize new agent project
- `package-cmd` — Package management utilities

**Key Modules:**
- `lib/api-client.ts` — HTTP client for marketplace API
- `lib/auth-store.ts` — Wallet authentication & storage
- `lib/config.ts` — CLI configuration management
- `lib/extractor.ts` — Extract agent metadata from packages
- `lib/installer.ts` — Package installation logic
- `lib/logger.ts` — Colored console output
- `lib/manifest-reader.ts` — Parse agent manifests
- `lib/metadata-store.ts` — Local metadata caching
- `lib/packager.ts` — Create deployable packages
- `lib/signer.ts` — Sign transactions & messages

### packages/db (~450 LOC)

**Drizzle ORM Schema (6 tables on Neon PostgreSQL):**

| Table | Key Columns | Purpose |
|-------|------------|---------|
| creators | id, walletAddress (unique), displayName, bio, createdAt, updatedAt | Marketplace creators |
| agents | id, slug (unique), creatorId, name, description, category, packageUrl, currentVersion, downloads, trustScore, trustTier, status, tags (JSONB) | Agent registry |
| agent_versions | id, agentId, version, downloadUrl, metadata (JSONB), createdAt | Version history |
| ratings | id, agentId, userWallet, score (1-5), review, createdAt | User reviews & trust signals |
| downloads | id, agentId, userWallet, timestamp | Download tracking |
| relations | Foreign key constraints | Referential integrity |

**Removed:**
- `transactions` (x402 payments deferred to Phase 4)
- `agentMetrics` & `agentShowcase` (simplified MVP)

**Key Patterns:**
- Inferred types: `Agent`, `Creator`, etc. (zero duplication via Drizzle `$inferSelect`/`$inferInsert`)
- Relationships: `creatorAgents`, `agentCreator` (one-to-many)
- Indices: `agents_creator_id_idx`, `downloads_agent_id_idx`

**Client Setup:**
- Neon serverless for edge (API routes)
- Connection pooling via Drizzle client

### packages/types (~200 LOC)

**Shared Enums:**
```typescript
type AgentCategory = 'utility' | 'ai' | 'data' | 'dev-tools' | 'automation' | 'other';
type TrustTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
type AgentStatus = 'published' | 'draft' | 'deprecated' | 'unlisted';
```

**Interfaces:**
```typescript
interface Agent { id, slug, creatorId, name, description, category, packageUrl, currentVersion, downloads, trustScore, trustTier, status, tags }
interface Creator { id, walletAddress, displayName, bio, createdAt, updatedAt }
interface AgentVersion { id, agentId, version, downloadUrl, metadata }
interface Rating { id, agentId, userWallet, score, review, createdAt }
interface Download { id, agentId, userWallet, timestamp }
```

## Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 15.1.7 | Full-stack, App Router |
| Frontend | React | 19 | UI components |
| Styling | TailwindCSS | 4 | Utility CSS |
| UI Components | shadcn/ui | latest | Pre-built components |
| Animations | Framer Motion | latest | UI animations |
| Auth | SIWE | 3 | Sign-In with Ethereum |
| Session | NextAuth | 5β | Session management |
| Wallet | ethers.js | 6 | EVM client (RainbowKit removed) |
| Database | Drizzle ORM | 0.45 | Type-safe ORM |
| Database | Neon | serverless | PostgreSQL edge runtime |
| Storage | Cloudflare R2 | latest | Object storage for packages |
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
├─ CLI in local mode
└─ Neon (serverless PostgreSQL)
```

### Production
```
Vercel (Next.js + API routes)  +  Neon (PostgreSQL)  +  Cloudflare R2 (Storage)
├─ HTTPS only                  ├─ Backups enabled     ├─ Global CDN
├─ Auto-deploy on push         └─ Connection pooling  └─ Package storage
└─ Environment secrets
```

## Current Phase (Phase 1c - Redesign & CLI)

Completed Feb 24, 2026. Marketing redesign with 7 high-conversion sections, UI library adoption, CLI expansion, and R2 storage integration.

### Major Changes
- [x] Landing page redesigned (7 sections with animations)
- [x] RainbowKit removed, replaced with plain wallet button
- [x] shadcn/ui component library integrated (8 components)
- [x] Cloudflare R2 storage integration (3 utility modules)
- [x] CLI expansion (10 commands, 10 utility modules)
- [x] NPM package validation added
- [x] Agent version tracking schema
- [x] Download tracking schema
- [x] Removed gateway service entirely
- [x] Removed reference-agents entirely
- [x] Removed x402 payment schema (deferred to Phase 4)

## Known Limitations

### Current (Phase 1c)
- No health checks or metrics aggregation
- No x402 payment integration (deferred)
- No transaction tracking
- No creator analytics dashboard
- Trust scores static (read-only)

### Future (Phase 2+)
- [ ] Full-text search via PostgreSQL
- [ ] Creator analytics dashboard
- [ ] Health check automation (cron jobs)
- [ ] Metrics aggregation pipeline
- [ ] x402 payment integration
- [ ] Multi-chain support
