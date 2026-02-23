import { createDb } from "../lib/db";
import { agents } from "@repo/db";
import { eq, or, sql } from "drizzle-orm";
import { probeMcpEndpoint } from "../lib/mcp-health-probe";

const BATCH_SIZE = 50;
const FAILURE_THRESHOLD = 6; // 30 min at 5-min intervals before pausing

/**
 * Health check cron: validates MCP endpoints via initialize handshake.
 * - Active agents: pause after 6 consecutive failures (30 min)
 * - Paused agents: auto-resume when health check passes
 * - Tracks total/passed counters for uptime calculation (separate from request success)
 */
export async function handleHealthCheck(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);

  const checkableAgents = await db.query.agents.findMany({
    where: or(eq(agents.status, "active"), eq(agents.status, "paused")),
  });

  let checked = 0;
  let paused = 0;
  let resumed = 0;

  for (let i = 0; i < checkableAgents.length; i += BATCH_SIZE) {
    const batch = checkableAgents.slice(i, i + BATCH_SIZE);
    const results = await Promise.allSettled(
      batch.map((agent) => checkAgent(db, agent))
    );

    for (const result of results) {
      checked++;
      if (result.status === "fulfilled") {
        if (result.value === "paused") paused++;
        if (result.value === "resumed") resumed++;
      }
    }
  }

  console.log(`[health-check] checked=${checked} paused=${paused} resumed=${resumed}`);
}

type CheckResult = "ok" | "fail" | "paused" | "resumed";

async function checkAgent(
  db: ReturnType<typeof createDb>,
  agent: {
    id: string;
    mcpEndpoint: string;
    status: string;
    healthCheckFailures: number | null;
    healthCheckTotal: number | null;
    healthCheckPassed: number | null;
  },
): Promise<CheckResult> {
  const { healthy } = await probeMcpEndpoint(agent.mcpEndpoint);

  // Always increment total counter for uptime tracking
  const counterUpdate = {
    healthCheckTotal: sql`COALESCE(${agents.healthCheckTotal}, 0) + 1`,
  };

  if (healthy) {
    // Increment passed counter
    const passedUpdate = {
      ...counterUpdate,
      healthCheckPassed: sql`COALESCE(${agents.healthCheckPassed}, 0) + 1`,
    };

    if (agent.status === "paused") {
      await db.update(agents).set({
        ...passedUpdate,
        status: "active",
        healthCheckFailures: 0,
      }).where(eq(agents.id, agent.id));
      console.log(`[health-check] agent=${agent.id} resumed`);
      return "resumed";
    }

    if ((agent.healthCheckFailures ?? 0) > 0) {
      await db.update(agents).set({
        ...passedUpdate,
        healthCheckFailures: 0,
      }).where(eq(agents.id, agent.id));
    } else {
      await db.update(agents).set(passedUpdate).where(eq(agents.id, agent.id));
    }
    return "ok";
  }

  // Health check failed — increment total but NOT passed
  const newFailures = (agent.healthCheckFailures ?? 0) + 1;

  if (newFailures >= FAILURE_THRESHOLD && agent.status === "active") {
    await db.update(agents).set({
      ...counterUpdate,
      healthCheckFailures: newFailures,
      status: "paused",
    }).where(eq(agents.id, agent.id));
    console.warn(`[health-check] agent=${agent.id} paused after ${newFailures} failures`);
    return "paused";
  }

  await db.update(agents).set({
    ...counterUpdate,
    healthCheckFailures: newFailures,
  }).where(eq(agents.id, agent.id));
  return "fail";
}
