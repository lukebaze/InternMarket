# InternMarket - Project Roadmap

## Current Status: Phase 1c Complete (Redesign & CLI)

**Last Updated:** February 24, 2026

**MVP Definition:** Phase 1c = Marketing redesign + UI library + CLI package manager + R2 storage integration

**Deployed:** Next.js 15 frontend on Vercel, 6-table PostgreSQL schema on Neon, Cloudflare R2 for package storage

## Phase Overview

| Phase | Duration | Status | Focus | Target Date |
|-------|----------|--------|-------|-------------|
| **Phase 1: Foundation** | 4 weeks | Complete | Core infrastructure, auth, schema | Feb 23, 2026 |
| **Phase 1b: Free Skill → Paid Execution MVP** | 1 week | Complete | Gateway hardening, x402, agent CRUD | Feb 23, 2026 |
| **Phase 1c: Redesign & CLI** | 1 week | **Complete** | Marketing redesign, UI lib, CLI, R2 storage | Feb 24, 2026 |
| **Phase 2: Marketplace Discovery** | 4 weeks | Planned | Discovery API, search, filtering, analytics | ~Mar 24, 2026 |
| **Phase 3: Trust System** | 3 weeks | Planned | Auto-scoring, health checks, metrics | ~Apr 14, 2026 |
| **Phase 4: Payments & Ratings** | 2 weeks | Planned | x402 integration, rating system | ~Apr 28, 2026 |
| **Phase 5: Scale & Polish** | 4 weeks | Planned | Performance, security, public beta | ~May 26, 2026 |

## Phase 1: Foundation (Complete)

### Objectives
- [x] Monorepo structure (pnpm + Turborepo)
- [x] Database schema with Drizzle (7 tables)
- [x] Web3 authentication (SIWE + NextAuth)
- [x] Wallet connection (RainbowKit + Wagmi)
- [x] Protected routes (middleware)
- [x] Shared TypeScript types
- [x] Cloudflare Workers gateway scaffold
- [x] Initial documentation

### Deliverables

| Item | Status | Notes |
|------|--------|-------|
| Monorepo scaffold | Complete | pnpm workspaces, Turbo config |
| Database (Neon) | Complete | 7 tables, indexes, relations |
| Auth flow | Complete | SIWE + NextAuth 5 beta working |
| Next.js frontend | Complete | Landing, marketing, dashboard, agent pages |
| Hono gateway | Complete | Proxy, x402, health, metrics, trust recalc |
| Shared packages | Complete | @repo/types, @repo/db, @repo/tsconfig |
| .env.example | Complete | All required variables documented |

---

## Phase 1c: Redesign & CLI (Complete)

Completed 2026-02-24. Major overhaul: removed gateway & reference agents, added marketing redesign, UI library, CLI package manager, R2 storage.

### What Changed
- [x] **Removed:** `apps/gateway/` entirely (Hono edge API)
- [x] **Removed:** `apps/reference-agents/` entirely (echo, text-summarizer, code-formatter)
- [x] **Removed:** `transactions`, `agentMetrics`, `agentShowcase` DB tables
- [x] **Removed:** RainbowKit wallet integration (replaced with plain ethers.js button)
- [x] **Removed:** Pages: playground, spending, usage, api-keys, transactions
- [x] **Added:** `apps/web/src/components/marketing/` (9 files, 721 LOC)
  - Hero, problem, buyers, creators, security, social-proof, category sections
  - Terminal animation, motion variants for Framer Motion
- [x] **Added:** `apps/web/src/components/ui/` (8 shadcn/ui components)
  - Badge, button, card, dialog, input, skeleton, table, tabs
- [x] **Added:** `apps/web/src/lib/r2/` (R2 client & operations)
- [x] **Added:** `packages/cli/` (10 commands, 10 utility modules)
  - publish, install, uninstall, update, list, login, logout, analytics, init, package-cmd
- [x] **Added:** `packages/db/schema/agent-versions.ts` (version tracking)
- [x] **Added:** `packages/db/schema/downloads.ts` (download tracking)
- [x] **Added:** `packages/cli/src/lib/package-validator.ts` (NPM validation)
- [x] **Added:** API routes: search, upload/presigned, download, versions
- [x] **Added:** Pages: consumer/favorites, consumer/settings, dashboard/settings

### Simplified Architecture
- **Was:** 3-tier (browser → Next.js → Hono gateway → Neon)
- **Now:** 2-tier (browser/CLI → Next.js + API routes → Neon + R2)
- **Benefit:** Reduced complexity, faster iteration, single deployment surface

---

## Phase 2: Marketplace Discovery (Planned - 4 weeks)

Target: ~Mar 24, 2026. Transform basic agent listing into discovery engine.

### Objectives
- Full-text search via PostgreSQL (pg_trgm extension)
- Advanced filtering: category, downloads, rating, version
- Creator profile pages with agent showcase
- Download statistics & trending agents
- Agent comparison UI

### Key Features

```
GET /api/search?q=code&category=utility&sort=downloads&limit=20

Response: {
  agents: [
    {
      slug, name, description, category, currentVersion,
      downloads, trustScore, trustTier,
      ratingAvg, creator: { displayName, walletAddress }
    }
  ],
  total: 42
}

GET /api/agents?sort=downloads&limit=10&offset=0
  Response: Popular agents with download counts
```

### Planned Components
- SearchBar with autocomplete via `/api/search`
- AgentCard enhanced with download count badge
- CreatorProfile page showing all published agents
- DownloadStatsCard (trending chart)
- FilterSidebar (category, rating, version)

### Database Optimizations
- Create full-text search index on `agents.name` & `agents.description`
- Add index on `downloads(agentId)` for count aggregations
- Cache popular agents list (30s TTL)

### Success Criteria
- Full-text search returns results in <100ms
- 50+ agents discoverable
- Download tracking accurate
- Creator pages show all agent versions

---

## Phase 3: Trust System (Planned - 3 weeks)

Target: ~Apr 14, 2026. Automate trust scoring and reliability monitoring.

### Objectives
- Auto-calculate trust scores from download + rating data
- Implement health check probes for agent endpoints
- Metrics aggregation pipeline (hourly rolls)
- Trust tier badge UI

### Key Features

**Trust Scoring Formula:**
```typescript
// Read-only score based on available signals
trustScore = (
  (downloadCount / maxDownloads * 0.40) +
  (ratingAvg / 5 * 100 * 0.30) +
  (recentUptime * 0.30)  // future: health checks
)

Tier Mapping:
- "new": downloads < 10
- "bronze": 10-99 downloads
- "silver": 100-999 downloads
- "gold": 1000+ downloads
- "platinum": 10000+ downloads + 4.5+ avg rating
```

**Health Check Service (Phase 3b):**
```
Every 5 minutes:
  FOR each published agent:
    Ping {packageUrl} (download endpoint)
    Record response time, status
    If failed 3x in a row:
      Alert creator via webhook
      (don't auto-pause; creator decides)
```

**Metrics Aggregation (Phase 3b):**
```
Hourly batch job:
  FOR each agent:
    COUNT downloads in last 24h
    CALC average rating from ratings table
    UPDATE agents table
    RECALC trustScore and trustTier
    Store historical snapshot
```

### Database Changes
- Add `agents.ratingCount, ratingSum` (denormalized)
- Add `agents.lastHealthCheckTime, lastHealthCheckStatus`
- Create `agentMetricsHistory` table for trends

### Services to Implement (Phase 3+)
- Health check endpoint (agent uptime monitoring)
- Metrics aggregation (download/usage stats)
- Trust score recalculation (on rating changes)

### Success Criteria
- Trust scores auto-update hourly
- Health checks 100% reliable (no false positives)
- Creator notifications working
- TrustBadge UI updated on agent cards

---

## Phase 4: Payments & Ratings (Planned - 2 weeks)

### Objectives
- Add rating system UI
- Integrate x402 payment protocol for agent calls
- Transaction tracking & creator payouts
- Payment verification workflow

### Key Features

**Rating System:**
- Submit 1-5 star review with optional text
- UI: Modal form on agent detail page
- Display: Recent reviews sorted by recency
- Impact: Feeds into trust score calculation

**x402 Integration:**
- Add `transactions` table back to schema
- Per-agent pricing: `agents.pricePerCall`
- Payment flow:
  ```
  Consumer calls agent
    ↓
  x402 header validation
    ↓
  Submit to facilitator
    ↓
  Record transaction:
    { agentId, consumerWallet, amount,
      platformFee, creatorPayout, status }
    ↓
  Update creator.totalRevenue
  ```

**Creator Payout Dashboard:**
```
GET /api/creators/:wallet/transactions
  [
    { id, agentId, amount, platformFee,
      creatorPayout, status, createdAt }
  ]

GET /api/creators/:wallet/payouts
  Monthly payout summary with status
```

### Database Changes
- Restore `transactions` table
- Add `agents.pricePerCall` (decimal)
- Add `creators.totalRevenue` (decimal)

### Success Criteria
- 50+ ratings submitted
- Transaction tracking accurate
- Creator payouts calculated correctly
- Zero payment mismatches

---

## Phase 5: Scale & Polish (Planned - 4 weeks)

### Objectives
- Performance optimization
- Security hardening
- Comprehensive documentation
- Public beta launch

### Tasks

**Performance:**
- [ ] Database query optimization (add missing indices)
- [ ] API response caching (Redis for agent lists)
- [ ] Frontend bundle analysis and code splitting
- [ ] Image optimization (avatars, showcase examples)
- [ ] Database connection pooling tuning

**Security:**
- [ ] CORS policy review and hardening
- [ ] Rate limiting on public endpoints
- [ ] Input validation on all API routes
- [ ] Security audit (external if budget allows)
- [ ] Secrets rotation and management

**Documentation:**
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Creator onboarding guide
- [ ] Developer integration guide (for agent creators)
- [ ] Architecture decision records (ADRs)
- [ ] Troubleshooting guide

**Launch:**
- [ ] Public announcement
- [ ] Incentive program for early agents
- [ ] Creator support channel (Discord/Telegram)
- [ ] Beta feedback collection
- [ ] Production readiness checklist

---

## Long-term Vision (6+ months)

### Phase 6: Ecosystem Features (Q3 2026)
- Multi-chain support (Polygon, Arbitrum, Optimism)
- Agent versioning and upgrades
- Custom MCP endpoints marketplace
- Creator referral program

### Phase 7: DAO Governance (Q4 2026)
- Governance token (INTERN)
- Community voting on fees and policies
- Creator advisory board

### Phase 8: AI Infrastructure (Q1+ 2027)
- Agent batching for cost optimization
- Request queuing and priority
- Automated agent discovery and onboarding
- Performance recommendations engine

---

## Known Issues & Backlog

### Must Fix (P0)
- [x] Finalize x402 facilitator selection (Base Sepolia testnet; Coinbase CDP for mainnet)
- [ ] Set trust tier thresholds based on market data
- [ ] Health check timeout tuning

### Should Fix (P1)
- [x] Add comprehensive error handling to API routes (JSON-RPC 2.0 error envelope)
- [x] Add request logging to gateway (metrics-collector service)
- [ ] Implement database connection pooling (Neon pg Pool exists; tune for prod)

### Nice to Have (P2)
- [ ] Email notifications for creators
- [ ] Agent analytics charts
- [ ] Dark mode UI
- [ ] Mobile-responsive dashboard

---

## Metrics to Track

### Platform Health
| Metric | Target | Current |
|--------|--------|---------|
| Uptime | 99.5% | Not measured yet |
| API p95 latency | <500ms | ~200ms (estimat'd) |
| Database query p95 | <100ms | ~50ms (estimat'd) |
| Agent coverage | 50+ agents | ~0 (MVP) |

### Creator Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Creator count | 50+ | ~2 (test) |
| Agent status "active" | >90% | N/A |
| Avg trust score | >3.5/5 | N/A |

### Business Metrics
| Metric | Target | Current |
|--------|--------|---------|
| Transactions/day | 100+ | 0 (MVP) |
| Avg transaction size | 0.01 ETH | N/A |
| Platform fee collected | 2+ ETH/month | 0 |
| Creator retention | >80% | N/A |

---

## Dependency Changes

### Planned Upgrades
- NextAuth 5 → v5 stable (when released)
- React 19 → v20 (if major features added)
- Drizzle ORM → latest (monthly)

### Planned Additions
- `resend` for email notifications (Phase 3)
- `redis` for caching (Phase 5)
- `bull` for job queues (Phase 5)
- `zod` for validation (Phase 2)

### Planned Removals
- None scheduled

---

## Budget & Resource Requirements

| Phase | Weeks | FTE | Estimated Spend |
|-------|-------|-----|-----------------|
| Phase 1 | 4 | 2 | $8K (infrastructure) |
| Phase 2 | 4 | 1.5 | $4K |
| Phase 3 | 3 | 1 | $2K |
| Phase 4 | 3 | 1.5 | $5K (facilitator) |
| Phase 5 | 4 | 2 | $6K (audit) |

**Total:** ~18 weeks, ~1.8 FTE average, ~$25K

---

## Stakeholder Communication

- **Weekly status:** Slack/Discord updates
- **Bi-weekly demo:** Live walkthrough of phase progress
- **Monthly review:** Metrics analysis, roadmap adjustment
