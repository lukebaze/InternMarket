import type { Context, Next } from "hono";

// In-memory rate limiter — MVP approach for CF Workers free tier.
// Upgrade to CF Rate Limit binding on paid plan for distributed limiting.
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60_000; // 1 minute window
const MAX_REQUESTS = 60;  // 60 req/min per IP

export async function rateLimiter(c: Context, next: Next) {
  const key =
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for") ||
    "unknown";

  const now = Date.now();
  let entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS };
    rateLimitMap.set(key, entry);
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return c.json({ error: "Rate limit exceeded", retryAfter }, 429);
  }

  c.header("X-RateLimit-Limit", String(MAX_REQUESTS));
  c.header("X-RateLimit-Remaining", String(MAX_REQUESTS - entry.count));

  await next();
}
