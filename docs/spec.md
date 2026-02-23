# InternMarket Specification

## Vision & Mission

**InternMarket** (interns.market) is an AI Agent Marketplace powered by the Model Context Protocol (MCP). It enables independent AI agent creators to package, deploy, and monetize intelligent services via a blockchain-based marketplace with transparent trust metrics and fair compensation.

**Mission:** Democratize AI agent creation and consumption by providing infrastructure for trust, discovery, and payment at the intersection of MCP and Web3.

## Target Users

- **AI Agent Creators:** Independent developers, researchers, and enterprises building MCP-compatible agents
- **AI Agent Consumers:** Developers, applications, and services seeking specialized AI capabilities
- **Platform Builders:** Companies integrating with MCP ecosystem seeking curated, vetted agent sources

## Core Features

### 1. Agent Marketplace
- Searchable registry of MCP-powered AI agents
- Agent discovery by category (marketing, assistant, coding, trading, social, copywriting, pm)
- Creator profiles with reputation and performance metrics
- Agent status management (active, paused, under_review)

### 2. MCP Integration Layer
- Native MCP endpoint support - agents expose `/mcp` protocol endpoints
- Flexible agentCard JSONB for raw MCP registry metadata
- Tool definitions stored and displayed (name, description)
- Full compatibility with MCP 1.0 specification

### 3. Trust & Reputation System
- Trust tiers: new, bronze, silver, gold, platinum
- Trust score calculation based on:
  - Success rate (30-day window)
  - Agent uptime (30-day window)
  - Performance metrics (p95 latency, unique consumers)
  - User ratings (1-5 scale with optional reviews)
  - Health check status
- Transparent metric visibility

### 4. Performance Monitoring
- Real-time health checks and latency tracking
- 30-day rolling metrics:
  - Total requests and success rate
  - P95 latency measurements
  - Unique consumer count
- Time-series data storage for trend analysis
- Health check failure tracking

### 5. Monetization via x402
- x402 HTTP payment integration for per-call pricing
- Payment flow: Consumer → Facilitator → Platform → Creator
- Transaction recording with payment hash tracking
- Platform fee deduction with creator payout calculation
- Transaction status: pending, completed, failed, refunded

## Technical Architecture

### Monorepo Structure (pnpm Turborepo)
```
interns-market/
├── apps/
│   ├── web          # Next.js 15 frontend + auth + API routes
│   └── gateway      # Cloudflare Workers edge API
├── packages/
│   ├── db           # Drizzle ORM + PostgreSQL schema
│   ├── types        # Shared TypeScript interfaces
│   └── tsconfig     # Shared config
```

### Database Layer (Drizzle + Neon PostgreSQL)
- **Neon Serverless Client** for edge/Workers
- **Node.js pg Pool** for backend services
- 7-table schema with cascade relationships

### Frontend Stack
- Next.js 15.1.7 with App Router
- React 19
- TailwindCSS 4
- RainbowKit + Wagmi for wallet connection
- SIWE + NextAuth 5 for Web3 auth

### Gateway Layer
- Cloudflare Workers (edge deployment)
- Hono v4 framework
- CORS middleware
- Bindings: DATABASE_URL, PLATFORM_WALLET, ENVIRONMENT

### Authentication
1. Wallet connection via RainbowKit (Base, Base Sepolia, Mainnet)
2. Nonce-based challenge from /api/nonce
3. SiweMessage creation and signing
4. NextAuth signature verification
5. JWT session with address + chainId
6. Middleware protection for /dashboard

## Database Entity Relationships

### Creators
```
id, walletAddress, displayName, avatarUrl, bio, totalRevenue,
createdAt, updatedAt
```
- Primary: wallet-based identification
- One creator → many agents
- totalRevenue tracks lifetime payouts

### Agents
```
id, slug, creatorId, name, description, category, mcpEndpoint,
creatorWallet, pricePerCall, agentCard (JSONB), tools (JSONB),
ratingAvg, totalCalls, status, trustScore, trustTier,
uptime30d, successRate30d, p95LatencyMs, uniqueConsumers30d,
healthCheckFailures, createdAt, updatedAt
```
- Unique slug for human-readable URLs
- Links to creator via creatorId
- Stores both MCP metadata and performance metrics

### Transactions
```
id, agentId, consumerWallet, amount, platformFee, creatorPayout,
x402PaymentHash, status, createdAt
```
- Records each x402 payment
- Tracks splits: amount → platformFee + creatorPayout
- Links to agent via agentId

### Ratings
```
id, agentId, userWallet, score (1-5), review, createdAt
```
- Enables trust scoring algorithm
- Links to agent via agentId

### AgentMetrics
```
id, agentId, timestamp, totalRequests, successfulRequests,
failedRequests, avgLatencyMs, p95LatencyMs, uniqueConsumers
```
- 30-day rolling window metrics
- Time-series data for trend analysis

### AgentShowcase
```
id, agentId, title, description, inputExample, outputExample,
sortOrder, createdAt
```
- Curated demo examples per agent
- For marketplace preview

## Authorization Model

### Roles & Permissions
| Role | Read | Create Agents | Modify Own | Modify Any | Admin |
|------|------|----------------|-----------|------------|-------|
| Anon | Yes (public) | No | No | No | No |
| Creator | Yes + own stats | Yes | Yes | No | No |
| Admin | All | Yes | Yes | Yes | Yes |

### Protection Mechanisms
- SIWE signature verification for transaction write access
- Middleware guards /dashboard route
- Creator ID validation on agent modifications
- Transaction verification against x402 payment hash

## Payment Flow (x402)

1. **Consumer initiates call** to agent MCP endpoint
2. **Gateway intercepts** → checks x402 header requirements
3. **Payment request** sent to x402 facilitator with:
   - Amount: pricePerCall from agents table
   - Recipient: PLATFORM_WALLET
4. **Facilitator processes** payment
5. **Transaction recorded** with x402PaymentHash
6. **Split calculated**: amount × (1 - platformFeePercent) → creatorPayout
7. **Creator wallet updated** with totalRevenue increment

## Agent Lifecycle

1. **Register:** Creator registers via web UI with MCP endpoint
2. **Initial Status:** "active" or "under_review"
3. **Health Checks:** Periodic endpoint health monitoring
4. **Metrics Aggregation:** Hourly/daily rolling metrics updated
5. **Trust Calculation:** Trust tier updated based on metrics
6. **Marketplace Discovery:** Public listing if status=active
7. **Deprecation:** Status → "paused" or delisting if healthCheckFailures spike

## API Surface Area

### Web Frontend Routes (Next.js)
- `GET /` - Landing page
- `GET /api/nonce` - Challenge for SIWE signing (returns nonce for SiweMessage)
- `POST /api/auth/[...nextauth]` - NextAuth endpoints (SIWE callback + session)
- `GET /dashboard` - Protected creator dashboard (auth required)
- `GET /api/agents` - List agents with pagination & filters
- `GET /api/agents/:slug` - Agent details (metadata + creator info)
- `POST /api/agents` - Register new agent (auth required, MCP validation)
- `PUT /api/agents/:slug` - Update agent (auth required, ownership verified)
- `DELETE /api/agents/:slug` - Soft delete agent (status → paused)
- `GET /api/agents/:slug/showcase` - Agent demo examples
- `POST /api/agents/:slug/ratings` - Submit rating (auth required)
- `GET /creators/:wallet` - Public creator profile

### Gateway Routes (Cloudflare Workers / Hono)
- `GET /health` - Service health check (version, timestamp)
- `POST /agents/:slug/invoke` - Call MCP agent (x402 payment required)
- `GET /agents/:slug` - Agent detail (from gateway cache)
- `GET /agents` - List agents (from DB)
- `GET /agents/:slug/info` - Full agent info including MCP tools

### Internal Cron Jobs (Phase 1b+)
- Health check service (every 5 min) - Validates agent endpoints
- Metrics aggregation (hourly) - Calculates rolling 30-day stats
- Trust recalculation (hourly) - Updates trustScore and trustTier

## Phase 1b: Free Skill → Paid Execution MVP (Delivered)

Completed Feb 23, 2026. Gateway hardened with JSON-RPC 2.0 envelope, x402 integration, and full agent CRUD API.

### Key Deliverables
- **JSON-RPC 2.0 parser** — Handles RPC calls with standardized error envelope
- **Slug-based routing** — Human-readable agent URLs, replaced UUID
- **Body buffer middleware** — Fixes Cloudflare Workers double-read issue
- **SSE passthrough** — Streams MCP responses (Server-Sent Events)
- **x402 payment resolver** — Dynamic per-agent pricing config
- **USDC support** — Base Mainnet + Sepolia contract addresses
- **Refund logging** — Records upstream failures & transaction retries
- **Agent CRUD API** — POST/GET/PUT/DELETE endpoints with validation
- **Reference agents** — 3 CF Workers (echo, text-summarizer, code-formatter)
- **Creator auto-creation** — First agent registration creates creator record

## Future Considerations

### Phase 2: Marketplace Discovery (4 weeks)
- Advanced agent discovery (filters, sorting, full-text search)
- Creator reputation badges
- Featured agent listings
- Agent analytics dashboard

### Phase 3: Trust System Hardening (3 weeks)
- Auto-scoring pipeline refinement
- Health check reliability improvements
- Trust UI badges and certification

### Phase 4: Ecosystem Expansion (3+ weeks)
- Multi-chain support (Polygon, Arbitrum, Optimism)
- DAO governance for platform decisions
- Creator revenue sharing (referral system)
- Rating system integration

### Phase 5: Scale & Security (4 weeks)
- Performance optimization (caching, indexing)
- Security audit and hardening
- Public beta launch

### Breaking Changes & Deprecation
- MCP protocol version updates will require agent revalidation
- Trust tier thresholds adjustable with notice period
- Platform fee structure changes: 30-day deprecation notice
