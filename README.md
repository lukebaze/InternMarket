# InternMarket

**The App Store for AI Interns** — discover, install, and share AI interns with one command. Publish and monetize yours in minutes.

## Overview

InternMarket enables creators to:
- Publish AI interns (OpenClaw agents) in a searchable marketplace
- Build reputation through user ratings and trust scoring
- Monetize interns via one-time purchases, subscriptions, or tips
- Access transparent creator analytics and download metrics

Users can:
- Discover vetted, high-quality AI interns by category
- Install any intern with a single CLI command
- View trust tiers and community ratings
- Rate and review interns to build community trust

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js + React + TailwindCSS | 15 + 19 + 4 |
| **Auth** | SIWE + NextAuth (migrating to Clerk) | 3 + 5β |
| **Database** | Drizzle ORM + Neon PostgreSQL (migrating to Supabase) | 0.45 + serverless |
| **Payments** | Stripe Connect (planned) | — |
| **Monorepo** | pnpm + Turborepo | 10.25 + 2 |

## Project Structure

```
interns-market/
├── apps/
│   ├── web/              # Next.js 15 frontend + API routes
│   │   ├── src/app/      # App Router pages & routes
│   │   ├── src/components/
│   │   └── src/lib/
│   └── (gateway removed)
├── packages/
│   ├── db/               # Drizzle ORM + 7-table schema
│   ├── types/            # Shared TypeScript interfaces
│   └── tsconfig/         # Shared TS configurations
├── docs/                 # Documentation
├── plans/                # Development plans & research
└── package.json          # Root workspace
```

## Core Features

### AI Intern Marketplace
- Searchable registry of AI interns (OpenClaw agents)
- Intern discovery by category (marketing, assistant, coding, trading, social, copywriting, pm)
- Trust tiers (new, bronze, silver, gold)
- Download metrics and community ratings

### Authentication
- SIWE + NextAuth (migrating to Clerk in Phase 3)
- Protected creator dashboard

### Trust & Reputation
- Community-driven trust scoring via ratings and downloads
- Trust tier badges displayed on intern cards

### Monetization (Planned)
- One-time purchases, subscriptions, and tips via Stripe Connect
- Platform fee splitting
- Creator analytics and payout tracking

## Getting Started

### Prerequisites

- **Node.js:** 18+ (use `nvm use` if available)
- **pnpm:** 10.25+ (`npm install -g pnpm`)
- **PostgreSQL:** Local or Neon account
- **Ethereum Wallet:** MetaMask or compatible (for testing)

### 1. Install Dependencies

```bash
git clone https://github.com/yourusername/interns-market
cd interns-market
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env.local
```

Edit `.env.local` with:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@neon-hostname/dbname

# Authentication
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Wallet Connection
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your-walletconnect-id

# Gateway
NEXT_PUBLIC_GATEWAY_URL=http://localhost:8787

# Payments (x402)
PLATFORM_WALLET=0x...
X402_FACILITATOR_URL=https://facilitator.example.com
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Drizzle migration files
pnpm db:generate

# Apply migrations to Neon
pnpm db:migrate

# (Optional) Open Drizzle Studio for visualization
pnpm db:studio
```

### 4. Start Development Servers

```bash
# Starts both Next.js (:3000) and Hono gateway (:8787)
pnpm dev
```

Visit:
- **Frontend:** http://localhost:3000
- **Gateway:** http://localhost:8787

### 5. Test Authentication Flow

1. Click "Connect Wallet" on home page
2. Select wallet in RainbowKit modal
3. Sign the SIWE message
4. Redirected to `/dashboard` (protected route)

## Common Tasks

### Scripts

```bash
# Development
pnpm dev              # Start all dev servers
pnpm build            # Build all workspaces
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript type checking

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:studio        # Open Drizzle Studio

# Workspace-specific
pnpm --filter @repo/web dev     # Just frontend
pnpm --filter @repo/gateway dev # Just gateway
```

### Adding Dependencies

```bash
# Add to a workspace
pnpm --filter @repo/web add lodash
pnpm --filter @repo/db add drizzle-orm

# Add dev dependency
pnpm --filter @repo/web add -D @types/react
```

### Running Type Checks

```bash
pnpm type-check     # All workspaces
pnpm --filter @repo/web type-check
```

## Architecture

### Data Flow

```
Browser
  ↓ (RainbowKit + Wagmi)
Connect Wallet
  ↓ (SIWE signature)
NextAuth Authentication
  ↓ (JWT session)
Protected Dashboard
  ↓ (HTTPS)
Cloudflare Workers Gateway
  ↓ (Hono routes)
Neon PostgreSQL
  ↓ (Drizzle ORM)
7-Table Schema
```

### Authentication Flow

1. User connects wallet via RainbowKit
2. Fetches nonce from `/api/nonce`
3. Creates SIWE message with nonce
4. Signs message in wallet
5. NextAuth verifies signature
6. JWT session created (address + chainId)
7. Middleware protects /dashboard

### Database Schema

**7 Core Tables:**
- `creators` - Marketplace creators (walletAddress, displayName, bio, totalRevenue)
- `agents` - MCP agents (slug, mcpEndpoint, pricePerCall, agentCard JSONB, tools JSONB)
- `transactions` - Payment records (amount, platformFee, creatorPayout, x402PaymentHash)
- `ratings` - User reviews (score 1-5, optional review text)
- `agentMetrics` - 30-day performance (requests, latency, consumers, timestamp)
- `agentShowcase` - Demo examples (inputExample, outputExample, sortOrder)
- `relations` - Foreign key definitions

See `docs/system-architecture.md` for detailed schema relationships.

## Documentation

Comprehensive docs in `/docs`:

- **`spec.md`** - Project vision, features, payment flow, agent lifecycle
- **`project-overview-pdr.md`** - Product requirements, goals, success criteria
- **`codebase-summary.md`** - File inventory, workspace dependencies, build pipeline
- **`code-standards.md`** - TypeScript, Next.js, Hono, Drizzle patterns & conventions
- **`system-architecture.md`** - Data flows, auth flow, trust scoring, database schema
- **`project-roadmap.md`** - Phase breakdown, timeline, metrics, long-term vision

## Development Workflow

### 1. Planning
- Check `docs/project-roadmap.md` for current phase
- Create task in `plans/` directory

### 2. Implementation
- Follow conventions in `docs/code-standards.md`
- Keep code files <200 lines (split if needed)
- Use strict TypeScript across all workspaces

### 3. Type Checking
```bash
pnpm type-check
```

### 4. Linting
```bash
pnpm lint
# Fix issues
pnpm --filter @repo/web lint --fix
```

### 5. Testing (Phase 2+)
```bash
pnpm test
```

### 6. Commit
```bash
git add .
git commit -m "feat: add agent discovery endpoint"
```

## Deployment

### Frontend (Vercel)

```bash
git push origin main
# Auto-deploys to Vercel
# Preview URLs available in GitHub

# Environment variables in Vercel dashboard:
# - NEXTAUTH_SECRET
# - NEXTAUTH_URL (production URL)
# - NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
# - NEXT_PUBLIC_GATEWAY_URL (production Workers URL)
```

### Gateway (Cloudflare Workers)

```bash
cd apps/gateway
wrangler publish
# Auto-deploys to Cloudflare Workers edge

# Environment variables via wrangler.toml or dashboard:
# - DATABASE_URL
# - PLATFORM_WALLET
# - ENVIRONMENT
```

### Database (Neon)

Migrations are manual:

```bash
pnpm db:migrate
# Production: migrate main database
```

## Troubleshooting

### Issue: "NEXTAUTH_SECRET is not set"
**Solution:** Run `openssl rand -base64 32` and set in `.env.local`

### Issue: "DATABASE_URL connection refused"
**Solution:** Verify Neon URL in `.env.local`, check network access

### Issue: "RainbowKit modal not showing"
**Solution:** Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` in `.env.local`

### Issue: Workers not found at :8787
**Solution:** Verify `NEXT_PUBLIC_GATEWAY_URL=http://localhost:8787` in `.env.local`

### Issue: "Middleware is preventing dashboard access"
**Solution:** Sign out (clear auth cookies), reconnect wallet, sign SIWE message

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Follow `docs/code-standards.md`
4. Run `pnpm type-check && pnpm lint`
5. Commit with conventional messages
6. Push and create a Pull Request

## Security

- All SIWE signatures verified server-side
- NextAuth session tokens encrypted
- Middleware guards protected routes
- Environment secrets never committed
- CORS restricted to trusted origins (production)

See `docs/code-standards.md` for security checklist.

## License

MIT

## Support

- **Docs:** See `/docs` directory
- **Issues:** GitHub Issues
- **Discussions:** GitHub Discussions
- **Discord:** (Link TBD)

## Roadmap

**MVP Complete:** Phase 1 + Phase 1b (Web3 auth, 7-table schema, agent CRUD, x402 ready)
**Phase 2:** Marketplace - Search, filtering, discovery
**Phase 3:** Trust System - Auto-scoring, trust badges
**Phase 4:** Rating System - Ratings CRUD, trust integration
**Phase 5:** Scale - Performance, security, public beta launch

See `docs/project-roadmap.md` for detailed timeline and milestones.

---

Built with ❤️ for the AI Agent ecosystem
