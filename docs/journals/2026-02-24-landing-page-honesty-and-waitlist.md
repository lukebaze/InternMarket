# Journal: Landing Page Honesty + Waitlist + Getting Started

**Date:** 2026-02-24
**Branch:** main
**Commit:** a28bf52

## What Happened

Executed the "Close Landing Page to Product Gap" plan — two phases in one session.

### Phase 1: Tone Down + Wire Waitlist

**Problem:** Landing page showed fabricated stats (1,200+ agents, 50K installs, $2M earned, 847/week counter) that didn't match early-access reality. Waitlist form was stubbed.

**Changes:**
- Hero trust bar: `["1,200+ agents", "50k+ installs", "4.8 avg rating"]` -> `["Early Access", "Open Beta", "Join the Ecosystem"]`
- Creators section: removed fake stats row (10K+ Creators, $2M+ Earned, 50K+ Installs), replaced with vision text
- Social proof: replaced "847 installed this week" counter with "Early Access — Limited Beta" badge
- Category pills: removed fabricated counts (120, 95, 84, 210, 67, 53, 72)
- Added testimonial disclaimers to both creators + social proof sections
- Created `waitlist` table (schema/waitlist.ts) with unique email index
- Created POST /api/waitlist with email validation + duplicate handling (409)
- Wired form in social-proof-section with loading/error/success states

### Phase 2: Getting Started + Seed Data

**Problem:** Docs page was 207 LOC reference-heavy page. Seed had only 5 agents.

**Changes:**
- Rewrote docs/page.tsx from 207 LOC -> 21 LOC thin server wrapper
- Created getting-started-content.tsx (135 LOC) with "Use Agents" / "Sell Agents" tabs
- Expanded seed from 5 -> 8 agents across all 7 categories
- Added 12 ratings (was 6)
- Added `onConflictDoNothing()` for idempotent seed runs
- Split seed data into seed-data.ts to keep files under 200 LOC

### New Spec

Saved the InternsMarket v1 spec as `docs/internsmarket-spec-v1.md` — the canonical PRD for the project vision (AI Intern marketplace, .internagent package format, security model, monetization).

## Key Decisions

1. **Honest messaging over vanity metrics** — early access signals are more trustworthy than inflated numbers
2. **Waitlist as silent success on duplicates** — better UX than showing "already registered" error
3. **Tabs over sidebar TOC** — getting-started page with buyer/seller paths is more actionable than reference docs
4. **Modest seed numbers** — downloads 35-340 range, ratings 3.80-4.80, trust tiers "new"/"bronze" only

## Pending

- DB migration: run `DATABASE_URL=... drizzle-kit push` to create waitlist table in Neon
- drizzle-kit generate has interactive prompt issues due to schema drift from old migration (deleted tables like agent_metrics, transactions)

## Files Changed (11)

| File | Action |
|------|--------|
| hero-section.tsx | Modified |
| creators-section.tsx | Modified |
| social-proof-section.tsx | Modified |
| category-section.tsx | Modified |
| schema/waitlist.ts | Created |
| schema/index.ts | Modified |
| api/waitlist/route.ts | Created |
| docs/page.tsx | Rewritten |
| getting-started-content.tsx | Created |
| seed.ts | Rewritten |
| seed-data.ts | Created |
