import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { validateMcpEndpoint } from "@/lib/mcp-validator";

// Simple in-memory rate limiter: 10 req/min per session
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + 60_000 });
    return true;
  }

  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ valid: false, error: "Not authenticated" }, { status: 401 });
    }

    const address = (session.user as { address?: string }).address ?? "unknown";
    if (!checkRateLimit(address)) {
      return NextResponse.json({ valid: false, error: "Rate limit exceeded. Try again in 1 minute." }, { status: 429 });
    }

    const body = await request.json();
    const endpoint = body?.endpoint;

    if (!endpoint || typeof endpoint !== "string") {
      return NextResponse.json({ valid: false, error: "Missing endpoint parameter" }, { status: 400 });
    }

    const result = await validateMcpEndpoint(endpoint);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ valid: false, error: "Validation failed" }, { status: 500 });
  }
}
