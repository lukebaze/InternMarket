# InternMarket - System Architecture

## High-Level Overview

InternMarket is a 3-tier Web3 architecture: decentralized agents accessed via a central marketplace with blockchain authentication and x402 micropayments.

```
┌─────────────────────────────────────────────────────────────┐
│ Web Browsers / Client Applications                          │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS (REST + WebSocket)
      ┌──────▼────────────────────────────────────────────────┐
      │ Next.js Frontend (Vercel)                             │
      │ ├─ RainbowKit + Wagmi (wallet connection)             │
      │ ├─ SIWE Auth (Sign-In with Ethereum)                  │
      │ ├─ NextAuth 5 (session management)                    │
      │ └─ TailwindCSS UI                                     │
      └──────┬──────────────────────────┬────────────────────┘
             │                          │
       /api/nonce                  /api/auth/...
             │                          │
      ┌──────▼──────────────────────────▼────────────────────┐
      │ Edge API Gateway (Cloudflare Workers)                │
      │ ├─ Hono v4 Framework                                  │
      │ ├─ CORS Middleware                                    │
      │ ├─ Request routing & validation                       │
      │ └─ Health checks                                      │
      └──────┬──────────────────────────────────────────────┘
             │
       ┌─────▼──────────────────────────────────────────────┐
       │ Services Layer                                      │
       │ ├─ Auth Service (SIWE verification)                │
       │ ├─ Agent Registry Service                          │
       │ ├─ Trust Scoring Service                           │
       │ ├─ Payment Service (x402 integration)              │
       │ └─ Metrics Aggregation Service                     │
       └─────┬──────────────────────────────────────────────┘
             │ (via Drizzle ORM)
      ┌──────▼───────────────────────────────────────────────┐
      │ Database Layer (Neon PostgreSQL)                     │
      │ ├─ creators (marketplace creators)                    │
      │ ├─ agents (MCP agent registry)                        │
      │ ├─ transactions (payment records)                     │
      │ ├─ ratings (trust signals)                            │
      │ ├─ agentMetrics (30-day performance)                  │
      │ ├─ agentShowcase (demo examples)                      │
      │ └─ relations (foreign keys)                           │
      └──────┬───────────────────────────────────────────────┘
             │
       ┌─────▼──────────────────────────────────────────────┐
       │ External Services                                   │
       │ ├─ x402 Facilitator (payment processing)           │
       │ ├─ MCP Agents (agent endpoints)                    │
       │ └─ Blockchain RPC (Base/Mainnet)                   │
       └──────────────────────────────────────────────────────┘
```

## Monorepo Architecture

### Workspace Dependencies

```
┌────────────────────────────────────────────────────────────┐
│ Root (pnpm Workspace + Turborepo)                          │
│ ├─ Shared scripts: build, dev, lint, type-check, db:*     │
│ └─ Turbo cache for incremental builds                     │
└────────────────────────────────────────────────────────────┘
        │
        ├─── apps/web ────────────┐
        │    (Next.js Frontend)    │
        │                          │
        ├─── apps/gateway ────────┤─── packages/db ────────┐
        │    (Hono Workers)        │   (Drizzle ORM)        │
        │                          │                        │
        └─ Consumes ──────────────┴────── packages/types ──┤
                                  │       (TypeScript)     │
                                  │                        │
                                  └─ packages/tsconfig ────┘
                                     (TS configs)
```

### Workspace Communication

| From | To | Protocol | Use Case |
|------|----|----|---|
| web ↔ web | Internal | TypeScript imports | Components, hooks |
| web ↔ gateway | HTTP/REST | Fetch API | Agent queries, payments |
| web ↔ db | TypeScript | Direct imports | Type checking |
| gateway ↔ db | TypeScript | Direct imports | Schema, types |
| gateway ↔ MCP agents | HTTP/MCP | REST/socket | Agent calls |
| All ↔ types | TypeScript | Imports | Shared interfaces |

## Authentication Flow

```
User Browser                 Next.js App              Blockchain
     │                            │                         │
     │ 1. "Connect Wallet"        │                         │
     ├──────────────────────→ RainbowKit                   │
     │                            │                         │
     │                     2. Launches modal                │
     │◄──────────────────────────────────────────────────────
     │
     │ 3. User selects wallet & signs                       │
     ├──────────────────────────────────────────────────────→
     │ (connection in Wagmi store)                          │
     │
     │                     4. /api/nonce request            │
     │◄─────────────────────────────────────────────────────
     │
     │ 5. Creates SiweMessage with nonce                    │
     │    (address, chain, nonce, URI, version, etc.)       │
     │
     │ 6. Signs message in wallet                           │
     ├──────────────────────────────────────────────────────→
     │
     │                  7. POST /api/auth/callback          │
     │◄─────────────────────────────────────────────────────
     │    with signature + message                          │
     │
     │                  8. NextAuth verifies                │
     │                     (SIWE library validates sig)     │
     │
     │ 9. ✅ JWT session created                            │
     │    session = { address, chainId }                    │
     │
     │ 10. Redirect to /dashboard (protected)               │
     │◄─────────────────────────────────────────────────────
```

**Session Storage:** NextAuth JWT (encrypted in cookie)

**Middleware Guard:**
```typescript
// middleware.ts
if (pathname.startsWith('/dashboard')) {
  if (!session) return NextResponse.redirect('/');
}
```

## Data Flow: Agent Discovery

```
User clicks "Browse Agents"
           │
           ▼
    GET /api/agents (from gateway or web)
           │
           ▼
    Drizzle query: select * from agents where status='active'
           │
           ▼
    Database returns 50 agents with:
    - agent.name, description, category
    - agent.trustTier, trustScore, ratingAvg
    - agent.totalCalls, uptime30d, successRate30d
           │
           ▼
    Next.js renders AgentCard components
           │
           ▼
    User clicks agent → /agents/[slug]
           │
           ▼
    GET /agents/[slug]
           │
           ▼
    Drizzle: SELECT from agents + LEFT JOIN ratings + agentMetrics
           │
           ▼
    Return full agent data with:
    - Agent metadata + tools (JSONB)
    - Recent ratings
    - Last 30 days of metrics
           │
           ▼
    Display agent dashboard with trust badge + pricing
```

## Data Flow: x402 Payment

```
Consumer calls MCP Agent endpoint
           │
           ▼
    Gateway intercepts request
           │
           ▼
    Check x402 headers
    (required: amount, recipient, signature)
           │
           ▼
    Amount = agent.pricePerCall from database
           │
           ▼
    POST to x402_facilitator_url with payment request
    {
      amount: "0.001",
      recipient: PLATFORM_WALLET,
      agent: agent.id,
      consumer: msg.sender
    }
           │
           ▼
    Facilitator processes payment
           │
           ▼
    Callback: POST /api/transactions
           │
           ▼
    INSERT into transactions table:
    {
      agentId, consumerWallet, amount,
      platformFee = amount * 0.15,
      creatorPayout = amount * 0.85,
      x402PaymentHash, status: "completed"
    }
           │
           ▼
    UPDATE creators.totalRevenue += creatorPayout
           │
           ▼
    Return x402 header response to consumer
           │
           ▼
    Consumer receives agent response
```

## Database Schema Relationships

```
creators (1)
    │
    ├─ (1:N) → agents
    │
    └─ Identified by: walletAddress (unique)

agents (1)
    │
    ├─ (1:N) → transactions (agentId)
    ├─ (1:N) → ratings (agentId)
    ├─ (1:N) → agentMetrics (agentId, time-series)
    └─ (1:N) → agentShowcase (agentId)

Key Constraints:
- agents.creatorId REFERENCES creators.id ON DELETE CASCADE
- transactions.agentId REFERENCES agents.id
- ratings.agentId REFERENCES agents.id
- agentMetrics.agentId REFERENCES agents.id
- agentShowcase.agentId REFERENCES agents.id
```

## Trust Scoring Algorithm

```
calculateTrustScore(agent: Agent) {
  // Weighted formula
  successRate30d = agent.successRate30d    // 0-100
  uptime30d = agent.uptime30d              // 0-100
  avgRating = agent.ratingAvg              // 0-5 (normalize to 0-100)

  trustScore = (
    (successRate30d * 0.4) +
    (uptime30d * 0.3) +
    (avgRating / 5 * 100 * 0.3)
  )

  // Map to tier
  if (agent.totalCalls < 100) return "new"
  if (trustScore >= 95) return "platinum"
  if (trustScore >= 90) return "gold"
  if (trustScore >= 85) return "silver"
  if (trustScore >= 80) return "bronze"
  return "new"
}
```

## Metrics Collection

### Real-Time Metrics
- **Source:** Each successful agent call
- **Recorded:** In `agentMetrics` table
- **Fields:** timestamp, totalRequests, successfulRequests, failedRequests, avgLatencyMs, p95LatencyMs, uniqueConsumers

### Aggregation (Hourly)
```
FOR EACH agent IN agents
  AGGREGATE last 24h of detailed metrics
  INSERT into agentMetrics with hourly timestamp
  UPDATE agents.uptime30d, agents.successRate30d, agents.p95LatencyMs
  CALCULATE new trustScore
  UPDATE agents.trustTier
END
```

### Health Checks (Every 5 min)
```
FOR EACH agent with status='active'
  HTTP GET agent.mcpEndpoint + '/health'
  IF timeout or 5xx error
    agent.healthCheckFailures++
    IF failures > threshold (e.g., 12 in 1h)
      agent.status = 'paused'
      notify creator
  ELSE
    agent.healthCheckFailures = 0
END
```

## Deployment Topology

### Development
```
Local Workstation
├─ pnpm dev (Next.js on :3000)
├─ wrangler dev (Workers on :8787)
├─ PostgreSQL (local or neon)
└─ .env.local (secrets)
```

### Staging
```
Vercel (app preview)       Cloudflare (workers preview)       Neon (staging DB)
├─ PR → auto deploy        ├─ wrangler publish --env staging  └─ staging_ prefix
└─ NEXTAUTH_URL: preview   └─ NEXT_PUBLIC_GATEWAY_URL: staging
```

### Production
```
Vercel                     Cloudflare Workers            Neon (PostgreSQL)
├─ main branch push        ├─ wrangler publish           └─ main database
├─ NextAuth production     ├─ Bindings via wrangler.toml   (backups enabled)
├─ HTTPS only             ├─ Edge routing (99.9% uptime) └─ Connection pooling
└─ Environment secrets    └─ Global distribution
```

## Scaling Considerations

### Database
- **Current:** Single Neon instance with read replicas planned
- **Future:** PostgreSQL read replicas in 3+ regions
- **Caching:** Redis for trust scores, agent listings (Phase 2)

### Gateway
- **Current:** Single Cloudflare Workers script
- **Scaling:** Automatic via Cloudflare edge (no action needed)
- **Rate limiting:** Per IP (future)

### Frontend
- **Current:** Vercel auto-scaling
- **Future:** Geographic routing, CDN optimization

### Agents
- **Discovery:** Rate limiting on `/agents` endpoint
- **Health checks:** Staggered across time to avoid thundering herd
- **Timeout:** 30s per agent health check (fail fast)

## Security Boundaries

```
┌─────────────────────────────────────────────────────────┐
│ Public (No Authentication Required)                     │
│ ├─ GET /agents (list all active agents)                │
│ ├─ GET /agents/:slug (agent details)                   │
│ ├─ GET /creators/:wallet (public profile)              │
│ └─ GET /health                                          │
└─────────────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────┐
│ Protected (SIWE Authentication + Session)             │
│ ├─ POST /agents (create agent)                        │
│ ├─ PUT /agents/:slug (update agent)                   │
│ ├─ DELETE /agents/:slug (delete agent)                │
│ ├─ POST /transactions (record payment)                │
│ ├─ POST /ratings (submit review)                      │
│ └─ GET /dashboard (creator analytics)                 │
└─────────────────────────────────────────────────────────┘
             │
┌────────────▼──────────────────────────────────────────┐
│ Admin (Role-based, Future)                            │
│ ├─ PATCH /agents/:id/status (pause/resume)           │
│ ├─ DELETE /creators/:id (account termination)        │
│ ├─ GET /admin/analytics (platform metrics)           │
│ └─ POST /admin/trust-tiers (adjust thresholds)       │
└─────────────────────────────────────────────────────────┘
```

## Failure Modes & Recovery

| Failure | Impact | Recovery |
|---------|--------|----------|
| Agent endpoint down | Health check fail | Auto-pause if >threshold, creator notification |
| x402 facilitator down | Payments blocked | Queue transaction locally, retry hourly |
| Database connection fail | API 500 | Connection pooling retry, fallback to cache |
| Middleware auth fail | /dashboard inaccessible | Clear cookies, redirect to login |
| Vercel deployment fail | Web offline | Rollback to previous version automatically |
| Workers deployment fail | Gateway offline | Rollback via wrangler, Cloudflare dashboard |
