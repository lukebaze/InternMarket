# InternMarket - Product Development Requirements

## Project Identity

**Name:** InternMarket (interns.market)

**Type:** AI Agent Marketplace Platform (Web3 + MCP)

**Status:** Phase 1 + Phase 1b Complete (Free Skill → Paid Execution MVP Delivered)

**Owner:** Project Team

**Last Updated:** February 23, 2026

## Problem Statement

MCP-compatible AI agents exist but lack a standardized marketplace for discovery, trust, and monetization. Creators have no channel to monetize agents; consumers lack trust signals when selecting from decentralized sources.

## Solution Overview

InternMarket is a blockchain-based marketplace that:
- Centralizes agent discovery with transparent metadata
- Implements on-chain trust scoring from performance data
- Enables direct creator-to-consumer payments via x402
- Provides performance monitoring and reliability metrics

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

### MVP (Phase 1)
1. Agent registration and listing
2. Creator profiles
3. Web3 authentication (SIWE)
4. Trust tier system (draft implementation)
5. Transaction recording (x402 ready)
6. Basic performance metrics

### Near-term (Phase 2-3, Months 2-6)
7. Advanced search and filtering
8. Creator reputation dashboard
9. Agent analytics endpoint
10. Payment verification workflow
11. Health check automation
12. Notification system

## Technology Stack

| Layer | Tech | Version |
|---|---|---|
| Framework | Next.js | 15.1.7 |
| Frontend | React + TailwindCSS | 19 + 4 |
| Auth | SIWE + NextAuth | 3 + 5beta |
| Wallet | RainbowKit + Wagmi | 2.2 + 2.19 |
| Backend | Hono (Cloudflare Workers) | 4 |
| Database | Drizzle ORM + Neon | 0.45 + serverless |
| Package Manager | pnpm + Turborepo | 10.25 + 2 |

## Success Criteria

### Technical
- All endpoints have <500ms p95 latency
- Database queries optimized with proper indexes
- Type-safe across monorepo (strict TypeScript)
- Zero security vulnerabilities in dependencies

### Product
- Minimum 30 agents with >100 transactions each
- Average agent trust score >3.5/5.0
- Creator retention >80% monthly
- Platform fee structure validated through testing

### Business
- Creator onboarding time <10 minutes
- First payment recorded within 1 day of agent registration
- Marketplace visibility through MCP registry
- Partner interest from 5+ MCP ecosystem projects

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

## Out of Scope (Phase 1)

- Mobile app
- DAO governance
- Custom ML models
- Agent hosting/execution
- Multi-language support
- Advanced compliance (AML/KYC)

## Stakeholders

| Role | Responsibility |
|---|---|
| Project Lead | Vision alignment, roadmap |
| Frontend Developer | Web UI, Next.js architecture |
| Backend Developer | Gateway, API design |
| DevOps | Infrastructure, deployments |
| Security Reviewer | Vulnerability assessment |
