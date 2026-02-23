import type { Context } from "hono";
import { getAgentBySlug } from "../services/agent-lookup";
import type { GatewayDb } from "../lib/db";

/** Returns public agent metadata by slug — no payment required */
export async function handleAgentInfo(c: Context, db: GatewayDb) {
  const slug = c.req.param("slug");
  if (!slug) return c.json({ error: "Agent slug required" }, 400);

  let agent;
  try {
    agent = await getAgentBySlug(db, slug);
  } catch {
    return c.json({ error: "Failed to fetch agent" }, 503);
  }

  if (!agent) {
    return c.json({ error: "Agent not found" }, 404);
  }

  return c.json({
    id: agent.id,
    name: agent.name,
    slug: agent.slug,
    description: agent.description,
    category: agent.category,
    pricePerCall: agent.pricePerCall,
    tools: agent.tools,
    ratingAvg: agent.ratingAvg,
    totalCalls: agent.totalCalls,
    status: agent.status,
    trustScore: agent.trustScore,
    trustTier: agent.trustTier,
  });
}
