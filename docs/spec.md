# InternMarket Specification

## Vision & Mission

**InternMarket** (interns.market) is an AI Agent Package Marketplace. It enables developers to discover, install, rate, and share MCP-compatible agents via a Web3-authenticated marketplace with built-in distribution infrastructure.

**Mission:** Democratize AI agent distribution by providing infrastructure for discovery, trust, and installation at the intersection of MCP and Web3.

## Target Users

- **Agent Creators:** Developers building MCP-compatible agents seeking distribution
- **Agent Consumers:** Developers & applications looking for pre-built AI capabilities
- **Community:** Web3 builders seeking trusted, auditable agent sources

## Core Features (Current)

### 1. Agent Marketplace
- Discoverable registry of MCP-powered AI agents
- Filtering by category, downloads, rating, version
- Creator profiles with reputation
- Full-text search capability (Phase 2)

### 2. Package Distribution
- Direct download via CLI: `npm install @interns-market/agent-name`
- Cloudflare R2 storage for versioned packages
- Semantic versioning support (1.0.0, 1.0.1, etc)
- Version history & rollback capability

### 3. Trust & Reputation
- Community ratings (1-5 stars with optional reviews)
- Download count tracking
- Trust tiers: new → bronze → silver → gold → platinum
- Creator profiles with stats

### 4. Web3 Authentication
- Sign-In with Ethereum (SIWE) - no passwords
- NextAuth 5 JWT sessions
- Creator verification via wallet signature
- Browser wallet support (MetaMask, WalletConnect, etc)

## Database Schema (6 Tables)

### creators
```
id (uuid)
walletAddress (unique, indexed)
displayName
bio
createdAt
updatedAt
```

### agents
```
id (uuid)
slug (unique, indexed)
creatorId (FK → creators)
name
description
category
packageUrl (R2 link)
currentVersion (e.g., "1.0.0")
downloads (integer counter)
trustScore (0-100, read-only)
trustTier (new|bronze|silver|gold|platinum)
status (published|draft|deprecated|unlisted)
tags (jsonb array)
createdAt, updatedAt
```

### agent_versions
```
id (uuid)
agentId (FK → agents)
version (e.g., "1.0.0")
downloadUrl (R2 presigned URL)
metadata (jsonb: changelog, deps, etc)
createdAt
```

### ratings
```
id (uuid)
agentId (FK → agents)
userWallet
score (1-5)
review (text, optional)
createdAt
```

### downloads
```
id (uuid)
agentId (FK → agents)
userWallet (nullable - tracks anon downloads)
timestamp
```

### relations
Foreign key constraints & indices

## API Surface

### Public (No Auth)
- `GET /api/agents` - List agents (paginated, filterable)
- `GET /api/agents/:slug` - Agent details
- `GET /api/search?q=...` - Full-text search
- `GET /api/agents/:slug/versions` - Version history
- `GET /api/agents/:slug/download` - Download redirect

### Protected (SIWE Auth Required)
- `POST /api/agents` - Publish new agent
- `PUT /api/agents/:slug` - Update agent metadata
- `POST /api/agents/:slug/versions` - Upload new version
- `POST /api/ratings` - Submit rating
- `POST /api/upload/presigned` - Get R2 upload URL

### Auth
- `GET /api/nonce` - Get SIWE challenge
- `POST /api/auth/[...nextauth]` - NextAuth endpoints

## Agent Lifecycle

1. **Creation:** Creator fills form + connects wallet
2. **Package Upload:** CLI uploads tarball to R2
3. **Registration:** Marketplace records metadata & version
4. **Discovery:** Listed in search/filters if status=published
5. **Installation:** Users install via CLI: `npm install @interns-market/slug`
6. **Rating:** Users can rate after download
7. **Updates:** Creator publishes new versions anytime
8. **Deprecation:** Creator marks as deprecated or delisted

## Technology Stack

| Component | Tech |
|-----------|------|
| Frontend | Next.js 15, React 19, TailwindCSS 4, shadcn/ui |
| Animations | Framer Motion |
| Auth | SIWE 3, NextAuth 5 |
| Wallet | ethers.js 6 |
| Database | Drizzle ORM, Neon PostgreSQL |
| Storage | Cloudflare R2 |
| Package Mgr | pnpm, Turborepo |
| Deployment | Vercel (frontend + API routes) |

## Deployment Architecture

```
Browser/CLI
    ↓ HTTPS REST
Next.js (Vercel)
    ├─ Pages: /, /agents, /dashboard, etc
    ├─ API routes: /api/agents, /api/search, etc
    └─ Static assets
    ↓ Drizzle ORM
Neon PostgreSQL (Serverless)
    └─ 6 tables + indices
    ↓ Upload/Download
Cloudflare R2 (Global CDN)
    └─ Versioned packages
```

## CLI Package Distribution

### Installation
```bash
npm install -g @interns-market/cli
intern-market login --wallet metamask
intern-market publish ./my-agent
```

### Workflow
1. CLI reads `package.json` + MCP manifest
2. Creates tarball (package.tar.gz)
3. Requests presigned R2 URL
4. Uploads directly to R2
5. Calls `POST /api/agents` to register
6. Returns publishable slug

### Version Management
```bash
intern-market publish --version 1.1.0
# Creates agent_versions entry, updates agents.currentVersion
```

## Rating System

- 1-5 stars with optional text review
- Visible on agent detail page
- Impacts trust tier calculation (Phase 3+)
- One rating per user per agent (future: prevent duplicates)

## Search & Discovery (Phase 2)

- Full-text search on agent names/descriptions
- Filters: category, rating, downloads, version
- Sorting: newest, most-downloaded, highest-rated, trending
- Pagination: 20 results per page

## Trust System (Phase 3+)

**Current:** Trust scores are read-only for MVP

**Future Formula:**
```
trustScore = (
  (downloadCount / maxDownloads * 40%) +
  (ratingAvg / 5 * 100 * 30%) +
  (recentUptime * 30%)  // from health checks
) / 100

Tier Mapping:
- new: <10 downloads
- bronze: 10-99 downloads
- silver: 100-999 downloads
- gold: 1000+ downloads
- platinum: 10000+ downloads + 4.5+ rating
```

## x402 Payments (Phase 4+)

**Deferred to Phase 4.** Will add per-agent pricing via x402 HTTP payment header.

```
Consumer calls agent → includes x402 header
    ↓
Middleware validates amount = agent.pricePerCall
    ↓
Submits to x402 facilitator
    ↓
Records transaction:
{ agentId, consumerWallet, amount,
  platformFee: amount * 15%,
  creatorPayout: amount * 85% }
    ↓
Creator totalRevenue += creatorPayout
```

## Security Model

### Authentication
- SIWE signatures verified server-side
- No passwords or seed phrases
- JWT sessions in httpOnly cookies
- Middleware protects /dashboard

### Authorization
- Creators can only modify own agents
- Database-level checks: `WHERE creatorId=?`
- Input validation on all endpoints

### Data Protection
- TLS/HTTPS enforced
- No sensitive data in URLs
- Rate limiting on public endpoints (future)
- Input sanitization on search queries

## Error Handling

All API responses:
```json
Success:
{ "status": "ok", "data": {...} }

Error:
{ "error": "Invalid request", "message": "..." }

Auth Error (401):
{ "error": "Unauthorized" }
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Agent list p95 | <300ms |
| Agent detail p95 | <500ms |
| Search p95 | <200ms |
| Package download speed | >5 Mbps (R2 CDN) |
| Database query p95 | <100ms |

## Roadmap

### Current (Phase 1c)
- [x] Agent listing & discovery
- [x] Creator profiles
- [x] Web3 auth (SIWE + NextAuth)
- [x] Package distribution (R2 + CLI)
- [x] Rating system
- [x] Download tracking
- [x] Marketing landing page

### Phase 2 (4 weeks)
- [ ] Full-text search
- [ ] Advanced filtering & sorting
- [ ] Creator analytics dashboard
- [ ] Agent comparison

### Phase 3 (3 weeks)
- [ ] Auto-calculated trust scores
- [ ] Health check probes
- [ ] Metrics aggregation pipeline

### Phase 4 (2 weeks)
- [ ] x402 payment integration
- [ ] Creator payout dashboard
- [ ] Transaction tracking

### Phase 5 (4 weeks)
- [ ] Redis caching layer
- [ ] Database read replicas
- [ ] Security audit
- [ ] Public beta launch

## Known Limitations

- No multi-chain support yet (Base Sepolia/mainnet only)
- No MCP v2.0 support (v1.0 only)
- No advanced compliance (AML/KYC)
- No mobile app
- x402 payments deferred to Phase 4

## Success Metrics

- 50+ agents published
- 3.5+ average rating
- <5 min creator onboarding
- <500ms API p95 latency
- 80%+ creator monthly retention
