# InternMarket - System Architecture

## High-Level Overview

InternMarket is a 2-tier Web3 marketplace: Next.js frontend + API routes for package management, discovery, and ratings.

```
┌─────────────────────────────────────────────────────────────┐
│ Clients: Browser / CLI / External Apps                      │
└────────────┬────────────────────────────────────────────────┘
             │ HTTPS REST API
      ┌──────▼────────────────────────────────────────────────┐
      │ Next.js 15 (Vercel)                                   │
      │ ├─ App Router pages (/agents, /dashboard, etc)       │
      │ ├─ API Routes (/api/agents, /api/search, etc)        │
      │ ├─ SIWE Auth + NextAuth 5 (session)                  │
      │ ├─ UI: React 19 + TailwindCSS + shadcn/ui            │
      │ └─ Animations: Framer Motion                         │
      └──────┬──────────────────┬────────────────────────────┘
             │                  │
         Database          Storage
             │                  │
      ┌──────▼───────────────────▼──────────────────────────┐
      │ Data & Storage Layer                               │
      ├──────────────────────────────────────────────────────┤
      │ Neon PostgreSQL (6 tables)                           │
      │ ├─ creators (creator profiles)                      │
      │ ├─ agents (agent metadata)                          │
      │ ├─ agent_versions (version history)                 │
      │ ├─ ratings (user reviews 1-5)                       │
      │ ├─ downloads (download tracking)                    │
      │ └─ relations (foreign keys)                         │
      ├──────────────────────────────────────────────────────┤
      │ Cloudflare R2 (Package Storage)                      │
      │ └─ Agent packages (versioned bundles)               │
      └──────────────────────────────────────────────────────┘
```

## Technology Stack Summary

- **Frontend:** Next.js 15, React 19, TailwindCSS 4, shadcn/ui, Framer Motion
- **Auth:** SIWE 3, NextAuth 5, ethers.js
- **Database:** Drizzle ORM, Neon PostgreSQL
- **Storage:** Cloudflare R2
- **Build:** pnpm, Turborepo 2
- **Deployment:** Vercel (frontend + API routes)

## Authentication Flow

```
User Browser                    Next.js App                 Blockchain
     │                               │                           │
     │ 1. Click "Connect Wallet"     │                           │
     ├──────────────────────────────→│                           │
     │ 2. Opens wallet selector      │                           │
     │←──────────────────────────────┤                           │
     │                               │                           │
     │ 3. User signs in wallet       │                           │
     │─────────────────────────────────────────────────────────→
     │ (wallet connected in browser)  │                          │
     │                               │                           │
     │ 4. GET /api/nonce             │                           │
     │←─────────────────────────────┤                           │
     │                               │                           │
     │ 5. Client creates SiweMessage │                           │
     │    (address, chain, nonce, ...) │                         │
     │ 6. Signs in wallet            │                           │
     │─────────────────────────────────────────────────────────→
     │                               │                           │
     │ 7. POST /api/auth/callback    │                           │
     │    (message + signature)      │                           │
     │←─────────────────────────────┤                           │
     │ 8. NextAuth verifies sig      │                           │
     │    (SIWE library)             │                           │
     │ 9. ✅ JWT session created    │                           │
     │    (address, chainId)         │                           │
     │                               │                           │
     │ 10. Redirect /dashboard       │                           │
     │←──────────────────────────────┤                           │
```

**Session Storage:** NextAuth JWT (encrypted cookie, httpOnly)

## Database Schema

### Creators Table
```
id (uuid)           → Primary key
walletAddress       → Unique, indexed
displayName         → Creator name
bio                 → Profile bio
createdAt           → Timestamp
updatedAt           → Timestamp
```

### Agents Table
```
id (uuid)           → Primary key
slug (text)         → Unique human-readable URL
creatorId (uuid)    → FK → creators.id (CASCADE)
name                → Agent name
description         → Long description
category            → Categorization
packageUrl          → Direct package link
currentVersion      → Latest version
downloads           → Download counter
trustScore          → 0-100 score (read-only)
trustTier           → new | bronze | silver | gold | platinum
status              → published | draft | deprecated | unlisted
tags (jsonb)        → Array of tag strings
createdAt, updatedAt
```

### Agent_Versions Table
```
id (uuid)
agentId (uuid)      → FK → agents.id (CASCADE)
version             → Semantic version (e.g., 1.0.0)
downloadUrl         → URL to package archive
metadata (jsonb)    → Changelog, dependencies, etc
createdAt
```

### Ratings Table
```
id (uuid)
agentId (uuid)      → FK → agents.id
userWallet          → Rating author wallet
score               → 1-5 stars
review              → Optional text review
createdAt
```

### Downloads Table
```
id (uuid)
agentId (uuid)      → FK → agents.id
userWallet          → Downloader wallet (can be null)
timestamp           → Download time
```

## API Routes

### Public (No Auth)
```
GET  /api/agents              → List agents (paginated, filterable)
GET  /api/agents/:slug        → Agent details + versions + ratings
GET  /api/search              → Full-text search agents
GET  /api/agents/:slug/download → Download agent package
GET  /api/agents/:slug/versions → Version history
```

### Protected (Auth Required)
```
POST /api/agents              → Create/publish agent
PUT  /api/agents/:slug        → Update agent metadata
POST /api/agents/:slug/versions → Upload new version
POST /api/ratings             → Submit rating
POST /api/upload/presigned    → Get R2 presigned URL
```

### Auth
```
GET  /api/nonce               → Get challenge for SIWE
POST /api/auth/[...nextauth]  → NextAuth endpoints
```

## Storage Architecture (Cloudflare R2)

Bucket structure:
```
r2://internmarket-packages/
├── agents/
│   ├── {agentId}/
│   │   ├── v1.0.0.zip       → Package archive
│   │   ├── v1.0.1.zip
│   │   └── v1.1.0.zip
│   └── {agentId}/...
└── temp/
    └── uploads/             → Presigned URLs for clients
```

**Presigned URLs:** Clients upload directly to R2 via presigned POST URLs (15-min expiry).

## Data Flows

### Agent Discovery
```
User visits /agents
    ↓
GET /api/agents?category=utility&sort=downloads&limit=20
    ↓
DB Query: SELECT * FROM agents WHERE status='published' AND category=?
    ↓
Return paginated list with creator info + version count
    ↓
UI renders AgentCard components
```

### Agent Detail View
```
User clicks agent card
    ↓
GET /api/agents/:slug
    ↓
DB Queries:
  1. SELECT * FROM agents WHERE slug=?
  2. SELECT * FROM ratings WHERE agentId=? ORDER BY createdAt DESC
  3. SELECT * FROM agent_versions WHERE agentId=? ORDER BY createdAt DESC
  4. SELECT SUM(downloads) FROM downloads WHERE agentId=?
    ↓
Return agent + ratings + versions + download count
    ↓
UI renders agent detail page
```

### Agent Installation
```
User runs: npm install @interns-market/my-agent
    ↓
CLI resolves package via API: GET /api/agents/:slug/versions
    ↓
Returns latest version + downloadUrl
    ↓
CLI downloads package from R2 presigned URL
    ↓
Extracts & installs locally
    ↓
Logs download to: POST /api/ratings (implicit, captured server-side)
```

### Rating Submission
```
User submits 5-star review
    ↓
POST /api/ratings (auth required)
{
  agentId: "...",
  score: 5,
  review: "Great agent!"
}
    ↓
DB INSERT into ratings table
    ↓
Triggers cache invalidation: revalidatePath(/api/agents/:slug)
    ↓
UI updates immediately
```

## Scaling Considerations

### Database
- **Current:** Single Neon instance
- **Bottleneck:** High-cardinality queries (search, ratings)
- **Future:** Add read replicas, implement caching layer (Redis)

### Storage
- **Current:** Cloudflare R2
- **Scaling:** Automatic (global CDN included)

### API
- **Current:** Vercel auto-scaling
- **Optimization:** Cache agent lists (30s TTL), implement pagination

### Search (Phase 2+)
- Migrate to PostgreSQL full-text search
- Or integrate Algolia for advanced filtering

## Deployment Pipeline

### Development
```bash
pnpm dev
├─ Next.js on :3000
└─ API routes hot-reload
```

### Staging (via Vercel Preview)
```
Git push to feature branch
  ↓
Vercel auto-builds preview deployment
  ↓
Environment: NEXTAUTH_URL=preview-url
```

### Production
```
Git push to main
  ↓
Vercel builds + deploys
  ↓
Database migrations (manual)
  ↓
Environment: NEXTAUTH_URL=interns.market
```

## Security Model

### Authentication
- SIWE signature verification (client-side signing, no seed phrases)
- NextAuth JWT sessions (httpOnly cookies)
- Middleware protects /dashboard routes

### Authorization
- Creator can modify own agents only
- Query-level checks: `agentId IN (SELECT agents.id WHERE creatorId=?)`

### Data Protection
- No sensitive data in URL parameters
- Rate limiting on public endpoints (future)
- Input validation on all API routes

## Error Handling

### API Responses
```typescript
// Success
{ status: 'ok', data: {...} }

// Error
{ error: 'Invalid request', message: 'Agent not found' }

// Auth Error
{ error: 'Unauthorized' }  → HTTP 401
```

### Database Errors
- Wrap all queries in try-catch
- Log errors with context: `[moduleName:functionName]`
- Return generic error to client

### Client-Side
- Middleware catches auth failures → redirect to login
- API errors caught in route handlers → HTTP 5xx response

## Future Phases (Post-MVP)

### Phase 2: Advanced Discovery
- Full-text search on agent names/descriptions
- Filtering by category, version, trustScore
- Sorting: popularity, downloads, rating, newest

### Phase 3: Trust System
- Auto-calculated trust scores (read-only for now)
- Health check probes (future)
- Metrics aggregation (future)

### Phase 4: Payments
- x402 payment integration
- Transaction tracking table
- Creator payout dashboard

### Phase 5: Scale & Security
- Redis caching layer
- Database read replicas
- Security audit
- Public beta launch
