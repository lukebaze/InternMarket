# InternMarket

**The App Store for AI Interns** — discover, install, and monetize AI interns with one command.

## Overview

InternMarket is a marketplace for complete, ready-to-work AI interns (full OpenClaw agents). Creators package and sell AI interns. Users install them in one click — safe, sandboxed, and productive from day one.

**For Creators:**
- Publish AI interns as signed `.internagent` packages
- Monetize via one-time purchases, subscriptions, or free + tips
- Track downloads, ratings, and analytics from your dashboard
- 85% revenue share (15% platform fee)

**For Users:**
- Discover vetted interns by category (marketing, coding, trading, etc.)
- Install with a single CLI command: `internmarket install <slug>`
- Interactive TUI with permission checklist and setup wizard
- Trust tiers and community ratings for quality assurance

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15 + React 19 + TailwindCSS v4 |
| **Auth** | Clerk |
| **Database** | Drizzle ORM + Supabase PostgreSQL |
| **Storage** | Supabase Storage |
| **Payments** | Stripe Connect (planned) |
| **CLI** | Commander.js + Ink (React TUI) |
| **Monorepo** | pnpm + Turborepo |

## Project Structure

```
interns-market/
├── apps/
│   └── web/                # Next.js 15 frontend + API routes
│       ├── src/app/        # App Router pages & routes
│       ├── src/components/ # UI components (marketing, dashboard, agents)
│       └── src/lib/        # Server actions, storage, verification
├── packages/
│   ├── cli/                # InternMarket CLI (Commander + Ink TUI)
│   ├── db/                 # Drizzle ORM schema + migrations
│   ├── types/              # Shared TypeScript interfaces
│   └── tsconfig/           # Shared TS configurations
├── docs/                   # Project documentation
└── package.json            # Root workspace config
```

## Core Features

### Intern Marketplace
- Searchable registry across 10 categories (marketing, coding, trading, social, etc.)
- Trust tiers: new, bronze, silver, gold
- Download metrics and community ratings (1-5 stars with reviews)
- Creator profiles with portfolio pages

### Package Format (.internagent)
- Signed, compressed `.tar.gz` bundles with manifest, layers, and signatures
- Brotli-compressed text/skills/memory layers
- Differential updates (only changed layers)
- Zero secrets shipped — API keys entered at install time via secure wizard

### Security & Verification
- Ed25519 platform signatures on all packages
- VirusTotal + LLM scanning pipeline
- Verification states: pending, scanning, verified, rejected
- Granular permission checklist displayed at install time
- 50MB package size limit, banned file detection

### CLI (10 Commands)
```
internmarket install <slug>   # Install an intern (interactive TUI)
internmarket uninstall <slug> # Remove an intern
internmarket list             # Browse available interns
internmarket update [slug]    # Update interns
internmarket init             # Scaffold a new intern project
internmarket package          # Build .internagent from current directory
internmarket publish          # Publish to marketplace
internmarket analytics [slug] # View download analytics
internmarket login            # Authenticate with InternMarket
internmarket logout           # Clear credentials
```

### Authentication
- Clerk-based auth with `@clerk/nextjs`
- Middleware-protected creator dashboard (`/dashboard/*`)
- Server-side auth via `auth()` from `@clerk/nextjs/server`

## Getting Started

### Prerequisites

- **Node.js:** 18+
- **pnpm:** 10.25+ (`npm install -g pnpm`)
- **Supabase project** (database + storage)
- **Clerk account** (authentication)

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

Edit `.env.local`:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.xxxx:password@pooler.supabase.com:6543/postgres
DIRECT_URL=postgresql://postgres.xxxx:password@supabase.com:5432/postgres

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key
CLERK_SECRET_KEY=sk_test_your-key

# Supabase Storage
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Security (optional for local dev)
VIRUSTOTAL_API_KEY=your-key
PLATFORM_SIGNING_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
```

### 3. Database Setup

```bash
pnpm db:generate    # Generate Drizzle migrations
pnpm db:migrate     # Apply migrations to Supabase
pnpm db:seed        # Seed demo data (optional)
pnpm db:studio      # Open Drizzle Studio (optional)
```

### 4. Start Development

```bash
pnpm dev            # Starts Next.js on :3000
```

Visit http://localhost:3000

## Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build all workspaces
pnpm lint             # Run ESLint
pnpm type-check       # TypeScript checking

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Apply migrations
pnpm db:seed          # Seed demo agents & creators
pnpm db:studio        # Open Drizzle Studio

# Workspace-specific
pnpm --filter @repo/web dev
pnpm --filter @repo/cli build
```

## Database Schema

**8 Core Tables:**

| Table | Purpose |
|-------|---------|
| `creators` | Marketplace creators (clerkUserId, email, displayName, stripeConnectId) |
| `agents` | AI interns (slug, category, pricing, verification status, trust tier) |
| `agent_versions` | Version history (semver, packageUrl, sha256Hash, changelog) |
| `downloads` | Download tracking (agentId, versionId, userId, ipHash) |
| `ratings` | User reviews (score 1-5, review text) |
| `purchases` | Payment records (stripePaymentIntentId, amount, platformFee) |
| `waitlist` | Early access signups (email) |
| `relations` | Foreign key definitions |

## Architecture

```
Browser
  | (Clerk auth)
Next.js App Router
  | (Server Actions + API Routes)
Drizzle ORM
  | (SQL)
Supabase PostgreSQL
  |
8-Table Schema

Supabase Storage
  |
.internagent packages
```

### Auth Flow
1. User signs in via Clerk (social, email, etc.)
2. `clerkMiddleware()` protects `/dashboard/*` routes
3. Server actions call `auth()` for user identity
4. Creator record linked via `clerkUserId`

### Verification Pipeline
1. Creator uploads `.internagent` package
2. Platform validates manifest, checks permissions, scans for banned files
3. VirusTotal scan triggered
4. Ed25519 signature applied on verification
5. Status: pending → scanning → verified/rejected

## Documentation

Detailed docs in `/docs`:

- **`project-overview-pdr.md`** — Product requirements and goals
- **`codebase-summary.md`** — File inventory and workspace dependencies
- **`code-standards.md`** — TypeScript, Next.js, Drizzle patterns
- **`system-architecture.md`** — Data flows, auth, schema relationships
- **`project-roadmap.md`** — Phase breakdown and timeline

## Deployment

### Frontend (Vercel)

```bash
git push origin main  # Auto-deploys via Vercel

# Required env vars in Vercel dashboard:
# NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY
# DATABASE_URL, DIRECT_URL
# NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
```

### Database (Supabase)

```bash
pnpm db:migrate  # Run against production database
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Follow `docs/code-standards.md`
4. Run `pnpm type-check && pnpm lint`
5. Commit with conventional messages
6. Push and create a Pull Request

## Security

- Clerk handles all auth (no raw credential storage)
- Ed25519 platform signatures on verified packages
- VirusTotal integration for package scanning
- Middleware guards all protected routes
- Environment secrets never committed (`.env*` in `.gitignore`)
- Supabase Storage with service-role-only server access

## License

MIT

## Support

- **Docs:** `/docs` directory
- **Issues:** GitHub Issues

---

Built for the AI Intern economy.
