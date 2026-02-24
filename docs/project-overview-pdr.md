# InternMarket - Product Development Requirements

## Project Identity

**Name:** InternMarket (interns.market)

**Type:** AI Agent Package Marketplace (Web3 + NPM-style distribution)

**Status:** Phase 1c Complete (Redesign + CLI + R2 Storage)

**Owner:** Project Team

**Last Updated:** February 24, 2026

## Problem Statement

MCP-compatible AI agents exist but lack a standardized marketplace for discovery, distribution, and trust. Developers have no simple way to package & publish agents; consumers cannot discover or rate them.

## Solution Overview

InternMarket is a Web3 marketplace that:
- Centralizes agent discovery with transparent metadata
- Enables NPM-style package distribution via R2 + CLI
- Implements community trust scoring from ratings & downloads
- Provides creator profiles with earned reputation
- Foundation for future monetization (x402, Phase 4+)

## Target Audience

1. **Primary:** AI agent developers (indie + enterprise)
2. **Secondary:** AI service consumers (developers, apps)
3. **Tertiary:** MCP ecosystem builders seeking curated sources

## Core Goals

| Goal | Success Metric | Status |
|------|---|---|
| Marketplace MVP | 50+ agents listed, 10+ active creators | In progress |
| Trust system operational | Trust tier assignments working | Designed |
| Payment integration | x402 flow end-to-end | Designed |
| Authentication | SIWE + NextAuth verified | Complete |
| Scalable architecture | Handle 1000+ agents, 100 TPS | In progress |

## Non-Functional Requirements

| Requirement | Target | Notes |
|---|---|---|
| Performance | <200ms agent list, <500ms agent details | Gateway for latency |
| Uptime | 99.5% platform SLA | Exclude external agent failures |
| Security | SOC 2 Type II roadmap | Web3-first security model |
| Accessibility | WCAG 2.1 AA standard | Future phase |
| Data Retention | 90-day metric history | Configurable per tier |

## Key Features (MVP + 6 Months)

### MVP (Phase 1c - Current)
1. Agent registration and listing
2. Creator profiles with bio/avatar
3. Web3 authentication (SIWE + NextAuth)
4. Package distribution (R2 + CLI)
5. Rating system (1-5 stars)
6. Download tracking
7. Marketing landing page (7 high-conversion sections)

### Near-term (Phase 2-4, Months 2-6)
8. Full-text search & filtering
9. Creator analytics dashboard
10. Health check automation
11. Trust system hardening (auto-scoring)
12. x402 payment integration
13. Creator payout management

## Technology Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js | 15.1.7 |
| Frontend | React + TailwindCSS | 19 + 4 |
| UI Components | shadcn/ui | latest |
| Animations | Framer Motion | latest |
| Auth | SIWE + NextAuth | 3 + 5beta |
| Wallet | ethers.js | 6 |
| Database | Drizzle ORM + Neon | 0.45 + serverless |
| Storage | Cloudflare R2 | latest |
| Package Manager | pnpm + Turborepo | 10.25 + 2 |

## Success Criteria

### Technical
- All endpoints have <500ms p95 latency
- Database queries optimized with proper indices
- Type-safe across monorepo (strict TypeScript)
- Zero security vulnerabilities in dependencies
- Full test coverage for API routes

### Product
- 50+ agents published and discoverable
- Average rating >3.5/5.0 stars
- Creator retention >80% monthly
- Download tracking accurate
- CLI install/publish working seamlessly

### Business
- Creator onboarding time <5 minutes
- First agent published within 1 day of signup
- Marketplace visibility via search engines
- 5+ partners interested in integration

## Known Constraints

- **Blockchain:** Testnet (Base Sepolia) initially, then mainnet
- **Payment:** x402 integration requires facilitator availability
- **Database:** Single Neon instance (multi-region planned for Phase 3)
- **Regions:** Initially US/EU, Asia TBD
- **Agents:** MCP v1.0 only, v2.0 compatibility TBD

## Risks & Mitigation

| Risk | Impact | Mitigation |
|---|---|---|
| Low agent adoption | Revenue, market credibility | Incentive programs, creator support |
| Payment facilitator downtime | Transaction loss | Fallback payment methods, queue system |
| Trust score gaming | System integrity | Rate limiting, pattern detection, manual review |
| Gas price volatility | User experience | Batch transactions, off-chain state |

## Timeline & Milestones

| Phase | Duration | Status | Deliverables |
|---|---|---|---|
| Phase 1: Foundation | 4 weeks | Complete | Auth, DB, schema, marketplace scaffold |
| Phase 1b: Free Skill → Paid | 1 week | Complete | Gateway hardening, x402, agent CRUD, reference agents |
| Phase 2: Marketplace Discovery | 4 weeks | Planned | Discovery API, search, filtering, analytics |
| Phase 3: Trust System | 3 weeks | Planned | Auto-scoring hardening, trust UI, badges |
| Phase 4: Rating System | 2 weeks | Planned | Ratings CRUD, weighted trust integration |
| Phase 5: Scale & Security | 4 weeks | Planned | Performance, audit, public beta launch |

## Dependencies

- Neon PostgreSQL account (infrastructure)
- Cloudflare account (Workers deployment)
- Vercel account (Next.js hosting)
- x402 facilitator service (payment provider TBD)
- Ethereum testnet/mainnet access (wallet connections)

## Out of Scope (Phase 1c)

- Mobile app
- x402 payments (deferred to Phase 4)
- DAO governance
- Custom ML models
- Agent execution/hosting
- Multi-language support
- Advanced compliance (AML/KYC)
- Enterprise seat licensing

## Stakeholders

| Role | Responsibility |
|---|---|
| Project Lead | Vision alignment, roadmap |
| Frontend Developer | Web UI, Next.js architecture |
| Backend Developer | Gateway, API design |
| DevOps | Infrastructure, deployments |
| Security Reviewer | Vulnerability assessment |
