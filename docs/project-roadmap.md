# InternMarket - Project Roadmap

## Current Status: Phase 1 (Foundation) - 70% Complete

**Last Updated:** February 23, 2026

**Deployed:** Next.js frontend on Vercel, Workers gateway staging

## Phase Overview

| Phase | Duration | Status | Focus | Target Date |
|-------|----------|--------|-------|-------------|
| **Phase 1: Foundation** | 4 weeks | 70% | Core infrastructure, auth, schema | ~Mar 10, 2026 |
| **Phase 2: Marketplace** | 4 weeks | Planned | Discovery, search, filtering | ~Apr 7, 2026 |
| **Phase 3: Trust System** | 3 weeks | Planned | Auto-scoring, trust UI, badges | ~Apr 28, 2026 |
| **Phase 4: Payments** | 3 weeks | Planned | x402 integration, payouts | ~May 19, 2026 |
| **Phase 5: Scale & Polish** | 4 weeks | Planned | Performance, security, docs | ~Jun 16, 2026 |

## Phase 1: Foundation (70% Complete)

### Objectives
- [x] Monorepo structure (pnpm + Turborepo)
- [x] Database schema with Drizzle
- [x] Web3 authentication (SIWE + NextAuth)
- [x] Wallet connection (RainbowKit + Wagmi)
- [x] Protected routes (middleware)
- [x] Shared TypeScript types
- [x] Cloudflare Workers gateway scaffold
- [ ] Initial documentation (in progress)
- [ ] API route implementation (50%)
- [ ] Environment validation

### Deliverables

| Item | Status | Notes |
|------|--------|-------|
| Monorepo scaffold | Complete | pnpm workspaces, Turbo config |
| Database (Neon) | Complete | 7 tables, indexes, relations |
| Auth flow | Complete | SIWE + NextAuth 5 beta working |
| Next.js frontend | In progress | Landing + dashboard layout |
| Hono gateway | In progress | /health endpoint, bindings |
| Shared packages | Complete | @repo/types, @repo/db, @repo/tsconfig |
| Type safety | Complete | Strict TypeScript across all workspaces |
| .env.example | Complete | All required variables documented |

### Blockers / Risks
- **x402 facilitator not yet selected** → Impacts Phase 4
- **Trust scoring algorithm** → Needs finalization before Phase 3
- **Database migrations** → Need to set up drizzle-kit workflow

### Next Checkpoint
- [ ] Complete API routes (`/api/agents`, `/api/transactions`, `/api/ratings`)
- [ ] Connect database queries to endpoints
- [ ] Deploy to staging (Vercel + Workers)
- [ ] E2E test auth → dashboard flow

---

## Phase 2: Marketplace Discovery (Planned - 4 weeks)

### Objectives
- Implement agent listing & filtering
- Full-text search capability
- Category-based navigation
- Creator profile pages
- Agent detail page with showcase examples

### Key Features

```
GET /api/agents
  ?category=coding
  &sort=trustScore
  &limit=20
  &offset=0

Response: {
  agents: [
    {
      id, slug, name, description, category,
      trustTier, trustScore, ratingAvg,
      creator: { displayName, walletAddress },
      _count: { totalCalls, uniqueConsumers30d }
    }
  ],
  total: 143
}

GET /agents/:slug
  Response includes:
  - Full agent metadata
  - Creator info
  - Recent ratings (sorted by createdAt DESC)
  - Last 30 days of metrics
  - Showcase examples
```

### Database Queries to Add
- `findAgentsByCategory(category)` with pagination
- `findAgentsByCreator(creatorId)`
- `findTopAgentsByTrustScore(limit)`
- `searchAgents(query)` (full-text search)
- `getAgentWithMetrics(agentId)`

### UI Components
- `AgentCard` component (trust badge, price, rating)
- `AgentList` with filters/sorting
- `CreatorProfile` page
- `AgentDetail` page with tabs (overview, metrics, ratings, showcase)
- `SearchBar` with autocomplete

### Success Criteria
- <300ms agent list query (p95)
- Full-text search working
- 10+ agents indexed and discoverable
- Creator profiles populated

---

## Phase 3: Trust System (Planned - 3 weeks)

### Objectives
- Automate trust score calculation
- Implement trust tier assignment logic
- Health check service
- Metrics aggregation pipeline

### Key Features

**Trust Scoring Algorithm:**
```typescript
trustScore = (
  (successRate30d * 0.40) +
  (uptime30d * 0.30) +
  (ratingAvg / 5 * 100 * 0.30)
) / 100  // 0-100 scale

Tier Mapping:
- "new": totalCalls < 100 OR freshly registered
- "bronze": trustScore >= 80, totalCalls >= 100
- "silver": trustScore >= 85, totalCalls >= 500
- "gold": trustScore >= 90, totalCalls >= 1000
- "platinum": trustScore >= 95, totalCalls >= 2000 + zero recent failures
```

**Health Check Service:**
```
Every 5 minutes:
  FOR each active agent:
    HTTP GET {mcpEndpoint}/health
    Record latency, status
    If 3+ consecutive failures:
      agent.status = "paused"
      Notify creator via email/webhook
```

**Metrics Aggregation:**
```
Hourly:
  FOR each agent:
    Aggregate raw transaction metrics (last 24h)
    Calculate: successRate, avgLatency, p95Latency, uniqueConsumers
    Insert into agentMetrics table
    Update agents table with 30-day rolling values
    Recalculate trustScore and trustTier
```

### Database Changes
- Add `agent.healthCheckLastRun: timestamp`
- Add `agent.healthCheckLastStatus: 'ok' | 'failed'`
- Add `agent.lastMetricsUpdate: timestamp`
- Create indices on `agentMetrics(agentId, timestamp DESC)`

### Services to Implement
- `HealthCheckService` (runs every 5 min)
- `MetricsAggregationService` (runs hourly)
- `TrustScoringService` (calculates scores)
- `NotificationService` (alerts creators)

### Success Criteria
- Trust tiers auto-updated for all agents
- Health checks running reliably
- No false positives (agent marked paused when still up)
- <1 min to detect agent failure

---

## Phase 4: Payments & Monetization (Planned - 3 weeks)

### Objectives
- Integrate x402 payment protocol
- Implement payment verification
- Creator payout tracking
- Transaction dashboard

### Key Features

**x402 Integration:**
```
1. Consumer calls agent → includes x402 header
2. Gateway intercepts, validates amount = agent.pricePerCall
3. Submits to x402_facilitator_url for payment processing
4. Facilitator returns payment_hash
5. Gateway records transaction:
   {
     agentId, consumerWallet, amount,
     platformFee: amount * 0.15,
     creatorPayout: amount * 0.85,
     x402PaymentHash: hash,
     status: "completed"
   }
6. Update creator.totalRevenue += creatorPayout
```

**Creator Payout Dashboard:**
```
GET /api/creators/:wallet/payouts
  [
    {
      period: "2026-02",
      totalRevenue: "5.230",
      transactions: 523,
      payoutStatus: "pending" | "processing" | "completed"
    }
  ]

GET /api/creators/:wallet/transactions
  [
    {
      id, agentId, consumerWallet, amount,
      platformFee, creatorPayout, status,
      createdAt
    }
  ]
```

### Payout Strategy (Future)
```
Manual or automated:
- Minimum threshold: 0.1 ETH
- Frequency: monthly or weekly
- Destination: creator's connected wallet
- Fee: 0.5% per payout
```

### Success Criteria
- 100+ transactions recorded and verified
- 0 payment hash mismatches
- Creator dashboard shows accurate payouts
- Integration with facilitator tested end-to-end

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
- [ ] Finalize x402 facilitator selection
- [ ] Set trust tier thresholds based on market data
- [ ] Health check timeout tuning

### Should Fix (P1)
- [ ] Add comprehensive error handling to API routes
- [ ] Implement database connection pooling
- [ ] Add request logging to gateway

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
