# InternMarket - Code Standards

## TypeScript Configuration

All workspaces use **strict TypeScript** with shared configs in `packages/tsconfig`:
- `strict: true` (all strict checks enabled)
- `noImplicitAny: true`
- `strictNullChecks: true`
- `esModuleInterop: true`
- `skipLibCheck: true`

**Rule:** No `any` type without `@ts-ignore` comment explaining why.

## File Naming & Organization

### Naming Convention
- **TypeScript/JavaScript:** kebab-case (`.ts`, `.tsx`, `.js`)
  - `auth-provider.tsx`, `wagmi-config.ts`, `create-agent-form.tsx`
- **Directories:** kebab-case
  - `src/components/auth/`, `src/lib/`, `src/app/api/`
- **Exported symbols:** camelCase (functions/variables), PascalCase (components/types)

### File Size Limits
- **Code files:** <200 lines (split into modules)
- **Configuration:** <100 lines
- **Components:** <150 lines (extract hooks/utils)

### Monorepo Imports

**Use workspace imports with @repo prefix:**
```typescript
// ✅ Correct
import { creators, agents } from '@repo/db';
import type { Agent, Creator } from '@repo/types';
import { tsconfig } from '@repo/tsconfig';

// ❌ Avoid
import { creators } from '../../../packages/db/src/schema';
import type { Agent } from '../../types';
```

## Next.js Conventions (apps/web)

### Directory Structure
```
src/
├── app/                    # App Router
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # / route
│   ├── dashboard/         # /dashboard segment
│   │   └── page.tsx
│   └── api/
│       ├── auth/[...nextauth]/
│       └── nonce/
├── components/            # Reusable React components
│   ├── auth/             # Auth-related
│   └── agents/           # Agent-related (future)
├── lib/                   # Utilities
│   ├── auth.ts           # SIWE helpers
│   ├── wagmi-config.ts   # Wallet config
│   └── api.ts            # API client (future)
├── types/                # Local type augmentations
│   └── next-auth.d.ts
└── middleware.ts         # Route protection
```

### Component Patterns

**Functional Components with Types:**
```typescript
interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Provide auth context
  return <>{children}</>;
}
```

**Server vs Client Components:**
```typescript
// Default: server component
export async function Dashboard() {
  const data = await fetchMetrics();
  return <div>{data}</div>;
}

// Client: explicit 'use client' at top
'use client';
import { useState } from 'react';
export function ConnectButton() {
  const [connected, setConnected] = useState(false);
  return <button onClick={() => setConnected(!connected)}>Connect</button>;
}
```

### API Routes (Next.js App Router)
```typescript
// apps/web/src/app/api/[endpoint]/route.ts
export async function GET(request: Request) {
  try {
    // Validation
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return Response.json({ error: 'Missing id' }, { status: 400 });
    }

    // Business logic (prefer delegating to services)
    const result = await fetchData(id);
    return Response.json({ status: 'ok', data: result });
  } catch (error) {
    console.error('[GET] Route error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validation
    if (!body.name) {
      return Response.json({ error: 'Missing name' }, { status: 400 });
    }

    // Process
    const result = await createRecord(body);
    return Response.json({ status: 'ok', id: result.id }, { status: 201 });
  } catch (error) {
    console.error('[POST] Route error:', error);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

### Server Actions Pattern (Recommended for mutations)
```typescript
// apps/web/src/app/actions/agent-actions.ts
'use server';

import { db } from '@repo/db';
import { agents } from '@repo/db/schema';
import { revalidatePath } from 'next/cache';

/**
 * Server action to create an agent.
 * Called from client components with use case specific params.
 */
export async function createAgentAction(formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const creatorId = formData.get('creatorId') as string;

    // Validate
    if (!name || !slug) {
      throw new Error('Name and slug required');
    }

    // Create in DB
    const result = await db
      .insert(agents)
      .values({ name, slug, creatorId })
      .returning();

    // Revalidate cache
    revalidatePath('/agents');
    revalidatePath(`/agents/${slug}`);

    return { ok: true, agent: result[0] };
  } catch (error) {
    console.error('[createAgentAction]', error);
    throw error;
  }
}
```

**When to use Server Actions:**
- Form submissions (simpler than POST endpoints)
- Mutations that modify DB state
- Private operations that shouldn't expose DB logic
- Cache revalidation needed

**When to use API Routes:**
- Public APIs (CORS, versioning)
- Third-party integrations (webhooks)
- Complex middleware pipelines
- Stream responses (SSE)

## Hono Conventions (apps/gateway)

### Middleware Stack
```typescript
app.use('*', cors());  // CORS first
app.use('*', logger());  // Then logging
app.use('*', bodyBuffering());  // Buffer body (CF Workers double-read fix)
app.use('/api/*', authenticate());  // Then auth (future)
```

### Route Handlers with Error Envelope
```typescript
// Standard JSON-RPC 2.0 response (success)
app.get('/health', (c) => {
  return c.json({
    jsonrpc: '2.0',
    result: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: 'v1'
    },
    id: null
  });
});

// JSON-RPC error envelope
app.post('/agents/:slug/invoke', async (c) => {
  try {
    const body = await c.req.json();
    // Validation & MCP invocation
    return c.json({
      jsonrpc: '2.0',
      result: { agentResponse: '...' },
      id: body.id
    }, 200);
  } catch (error) {
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: 'Internal error',
        data: { details: String(error) }
      },
      id: null
    }, 500);
  }
});
```

### x402 Payment Config Pattern
```typescript
// Route handler
app.post('/agents/:slug/invoke', async (c) => {
  const slug = c.req.param('slug');
  const paymentConfig = await resolveX402PaymentConfig(slug);

  // Validate x402 headers
  const x402Header = c.req.header('x402-payment');
  if (!x402Header) {
    return errorEnvelope(c, -32001, 'Payment required', 402);
  }

  // Process payment via config
  const txResult = await processPayment(paymentConfig, x402Header);

  return c.json({ jsonrpc: '2.0', result: txResult, id: null });
});
```

### Type Safety
```typescript
type Bindings = {
  DATABASE_URL: string;
  PLATFORM_WALLET: string;
  ENVIRONMENT: 'development' | 'production';
};

const app = new Hono<{ Bindings: Bindings }>();

// Access in handlers
app.get('/config', (c) => {
  const dbUrl = c.env.DATABASE_URL;  // Type-safe!
  return c.json({ ok: true });
});
```

## Drizzle ORM Patterns (packages/db)

### Schema Definition
```typescript
import { pgTable, text, uuid, decimal, timestamp, jsonb, index } from 'drizzle-orm/pg-core';
import { creators } from './creators';

export const agents = pgTable(
  'agents',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    slug: text('slug').unique().notNull(),
    creatorId: uuid('creator_id')
      .references(() => creators.id, { onDelete: 'cascade' })
      .notNull(),
    // ... more columns
  },
  (table) => [
    index('agents_creator_id_idx').on(table.creatorId),
  ]
);

export type Agent = typeof agents.$inferSelect;
export type NewAgent = typeof agents.$inferInsert;
```

### Type Safety
```typescript
// Get inferred types - no manual duplication!
const agent: Agent = await db.query.agents.findFirst();
const newAgent: NewAgent = {
  slug: 'my-agent',
  creatorId: '...',
  // ... required fields
};
```

### Relationships
```typescript
// In relations.ts
export const creatorAgents = relations(creators, ({ many }) => ({
  agents: many(agents),
}));

export const agentCreator = relations(agents, ({ one }) => ({
  creator: one(creators, {
    fields: [agents.creatorId],
    references: [creators.id],
  }),
}));
```

### Queries (Future Pattern)
```typescript
// Simple select
const agents = await db.select().from(agents).limit(10);

// With filters
const creatorAgents = await db
  .select()
  .from(agents)
  .where(eq(agents.creatorId, creatorId));

// With relationships
const agentsWithCreator = await db.query.agents.findMany({
  with: { creator: true },
});
```

## Shared Types (packages/types)

### Enum Patterns
```typescript
export type AgentCategory =
  | 'marketing'
  | 'assistant'
  | 'copywriting'
  | 'coding'
  | 'pm'
  | 'trading'
  | 'social';

export type TrustTier = 'new' | 'bronze' | 'silver' | 'gold' | 'platinum';
export type AgentStatus = 'active' | 'paused' | 'under_review';
```

### Interface Patterns
```typescript
export interface Agent {
  // Database fields (camelCase, matching DB types)
  id: string;
  slug: string;
  creatorId: string;
  name: string;

  // Financial fields: store as decimal strings for precision
  pricePerCall: string;  // decimal
  trustScore: string;    // decimal

  // Complex data: use JSONB
  agentCard: AgentCard | null;  // arbitrary MCP metadata
  tools: AgentTool[] | null;

  // Timestamps: always Date objects
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Try-Catch Pattern
```typescript
export async function fetchAgent(id: string) {
  try {
    const agent = await db.query.agents.findFirst({
      where: eq(agents.id, id),
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    return agent;
  } catch (error) {
    console.error('[fetchAgent]', error);
    throw error;  // Re-throw or convert to app error
  }
}
```

### API Error Responses
```typescript
// Next.js
export async function GET(request: Request) {
  try {
    // ...
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

// Hono
app.get('/agents/:id', async (c) => {
  try {
    // ...
  } catch (error) {
    return c.json({ error: 'Not found' }, 404);
  }
});
```

## Testing Conventions

### Test File Naming
- `src/lib/__tests__/auth.test.ts` (co-located)
- `tests/unit/auth.test.ts` (separate)
- `tests/integration/api.test.ts`

### Test Structure
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('AuthFlow', () => {
  let mockSigner: Signer;

  beforeEach(() => {
    mockSigner = createMockSigner();
  });

  it('should verify SIWE signature', async () => {
    const message = createSiweMessage(...);
    const verified = await verifySiweMessage(message, mockSigner);
    expect(verified).toBe(true);
  });

  it('should reject invalid signatures', async () => {
    expect(() => verifySiweMessage(invalid, signer)).rejects.toThrow();
  });
});
```

## Documentation Standards

### Code Comments
```typescript
// Use for "why" not "what"
// ✅ Good
const trustScore = (successRate * 0.4) + (uptime * 0.3) + (ratings * 0.3);
// Weighted formula: success+availability drive trust, user sentiment validates

// ❌ Avoid
// Calculate trust score
const trustScore = calculateTrustScore(successRate, uptime, ratings);
```

### Function Documentation
```typescript
/**
 * Calculates agent trust tier based on performance metrics.
 *
 * Trust tiers:
 * - new: <100 transactions
 * - bronze: 100+ transactions, >90% success rate
 * - silver: 500+ transactions, >95% success rate, >99% uptime
 *
 * @param agent - Agent with metrics
 * @returns Trust tier string
 */
export function calculateTrustTier(agent: Agent): TrustTier {
  // Implementation
}
```

## Security Checklist

- [ ] All secrets in `.env.local`, never in code
- [ ] SIWE signature verification on auth endpoints
- [ ] Middleware guards /dashboard and admin routes
- [ ] SQL injection prevention (use Drizzle, never raw strings)
- [ ] XSS prevention (React auto-escapes, sanitize user input)
- [ ] CORS configured correctly (allow only needed origins)
- [ ] Environment validation on startup

## Pre-Commit Checklist

- [ ] No `console.log` except errors
- [ ] No `any` without explanation
- [ ] TypeScript strict mode passes: `pnpm type-check`
- [ ] Linting passes: `pnpm lint`
- [ ] Tests pass: `pnpm test` (when available)
- [ ] No hardcoded secrets or API keys
