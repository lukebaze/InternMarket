# InternsMarket Specification

**The App Store for AI Interns**
**Version:** 1.0 (MVP)
**Date:** February 24, 2026
**Tagline:** Hire your first AI intern in one click.

## Table of Contents
- [Overview & Vision](#overview--vision)
- [Core Concepts](#core-concepts)
- [CLI Experience](#cli-experience)
- [Package Format: .internagent](#package-format-internagent)
- [Creator Publishing Workflow](#creator-publishing-workflow)
- [End-User Installation Workflow](#end-user-installation-workflow)
- [Security & Verification](#security--verification)
- [Secrets & Environment Handling](#secrets--environment-handling)
- [Monetization Models](#monetization-models)
- [CLI Reference](#cli-reference)
- [Technical Architecture](#technical-architecture)
- [Marketing Positioning](#marketing-positioning)
- [Roadmap](#roadmap)
- [Risks & Legal](#risks--legal)

---

## Overview & Vision

InternsMarket is the **trusted marketplace** for complete, ready-to-work AI interns (full OpenClaw agents).

Creators train powerful AI interns locally with OpenClaw -> package & sell them.
Buyers install god-tier AI teammates in one click -- safe, sandboxed, and productive from day one.

We fix the chaos of ClawHub (security nightmares, no payments, no full-bot sharing) and create the **AI intern economy**.

---

## Core Concepts

- **AI Intern** = fully trained OpenClaw agent (skills + personality + memory + workflows)
- **.internagent** = signed, compressed, versioned intern package
- **Verified Intern** = passed VirusTotal + sandbox + human review
- **Revenue Share** = 15% platform fee (creators keep 85%)

---

## CLI Experience

**Creators (power users):**
`internmarket package && internmarket publish`

**End-users (anyone):**
`internmarket install marketing-intern`
-> Beautiful TUI with permission checklist, OAuth wizard, and "I'm not technical" mode.

**No-CLI options:** One-click web button, tiny helper script, or chat command.

---

## Package Format: .internagent

Lightweight signed `.tar.gz` (Docker-inspired layers for fast updates).

**Structure**

```
/
├── manifest.json
├── layers/ (base, skills, memory...)
├── thumbnail.png
├── .env.example (NEVER real keys)
└── signature.json
```

**Compression & Encryption Rules**
- Text, skills, memory -> Brotli compressed
- **API keys / env / secrets -> NEVER included** (see Secrets section)
- Differential updates only download changed layers.

---

## Creator Publishing Workflow

1. Train your AI intern locally in OpenClaw
2. `internmarket package` -> creates signed .internagent
3. `internmarket publish my-intern.internagent --price 79`
4. Auto-verification (5-15 min)
5. Live on marketplace + Stripe Connect payouts

Creator dashboard: sales analytics, one-click updates, remix fees.

---

## End-User Installation Workflow

```bash
internmarket install marketing-intern
```

TUI shows verified status -> granular permissions -> interactive setup wizard (OAuth + key entry) -> hot-reloads into OpenClaw.

One-click refund = auto-uninstall.

---

## Security & Verification

- Double signatures
- Firecracker/gVisor sandbox dry-run
- VirusTotal + LLM scans
- Granular permission UX
- "Verified" = human-reviewed
- 30-day money-back guarantee

---

## Secrets & Environment Handling

**Golden Rule:** Zero secrets ever ship in any .internagent.

Real keys are entered only at install time via secure wizard and stored in the user's OS keychain.

---

## Monetization Models

Creators keep 85%. Options:

- One-time ($49-$199)
- Subscription ($9-$29/mo)
- Free + tips
- Enterprise ($499+/yr)

Extra: 10% remix fees, sponsored placements, setup services.

---

## CLI Reference

```bash
internmarket package
internmarket publish <file.internagent> --price 79
internmarket install <slug>
internmarket list
internmarket update
```

---

## Technical Architecture

- Next.js 15 + TypeScript + Tailwind + shadcn/ui
- Supabase (DB + Storage + pgvector)
- Stripe Connect + Clerk auth
- Firecracker sandbox
- Node.js CLI with Ink TUI

---

## Marketing Positioning

- **Headline:** The App Store for AI Interns
- **Subheadline:** Creators earn passive income. Buyers get 24/7 AI teammates.
- **Positioning:** "The Shopify of personal AI interns -- built on OpenClaw."

---

## Roadmap

- **MVP (4 weeks):** CLI + marketplace + payments + sandbox
- **Phase 2:** Cloud-hosted interns ($19/mo), no-code builder, multi-platform support.

---

## Risks & Legal

- Strong sandbox + insurance for liability
- "Powered by OpenClaw" disclaimer
- Creators sign TOS
