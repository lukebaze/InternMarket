import { Hono } from "hono";
import { getAgentById } from "../services/agent-lookup";
import type { GatewayDb } from "../lib/db";

// Returns public agent metadata — no payment required
export function createInfoRoute(db: GatewayDb) {
  const route = new Hono();

  route.get("/", async (c) => {
    const agentId = c.req.param("agentId");

    let agent;
    try {
      agent = await getAgentById(db, agentId);
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
  });

  return route;
}
