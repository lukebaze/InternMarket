import { eq, and } from "drizzle-orm";
import { agents } from "@repo/db";
import type { GatewayDb } from "../lib/db";

// Fetch agent by ID — returns null if not found
export async function getAgentById(db: GatewayDb, agentId: string) {
  const result = await db.query.agents.findFirst({
    where: eq(agents.id, agentId),
  });
  return result ?? null;
}

// Fetch agent only if status is "active"
export async function getActiveAgent(db: GatewayDb, agentId: string) {
  const agent = await getAgentById(db, agentId);
  if (!agent || agent.status !== "active") return null;
  return agent;
}

// Fetch active agent by slug — used for slug-based gateway routing
export async function getActiveAgentBySlug(db: GatewayDb, slug: string) {
  const result = await db.query.agents.findFirst({
    where: and(eq(agents.slug, slug), eq(agents.status, "active")),
  });
  return result ?? null;
}

// Fetch agent by slug (any status) — used for agent info route
export async function getAgentBySlug(db: GatewayDb, slug: string) {
  const result = await db.query.agents.findFirst({
    where: eq(agents.slug, slug),
  });
  return result ?? null;
}
