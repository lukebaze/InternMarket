import { createDb } from "../lib/db";
import { agents, agentMetrics } from "@repo/db";
import { eq, sql, gte, and } from "drizzle-orm";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const MIN_CALLS_TO_QUALIFY = 50;

function computeTrustTier(score: number): string {
  if (score >= 90) return "platinum";
  if (score >= 75) return "gold";
  if (score >= 60) return "silver";
  if (score >= 40) return "bronze";
  return "new";
}

export async function handleTrustRecalc(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const activeAgents = await db.query.agents.findMany({
    where: eq(agents.status, "active"),
  });

  let updated = 0;
  for (const agent of activeAgents) {
    const metrics = await db
      .select({
        totalReqs: sql<number>`COALESCE(SUM(total_requests), 0)`,
        successReqs: sql<number>`COALESCE(SUM(successful_requests), 0)`,
        avgLatency: sql<number>`COALESCE(AVG(avg_latency_ms), 0)`,
        p95Latency: sql<number>`COALESCE(MAX(p95_latency_ms), 0)`,
        uniqueWallets: sql<number>`COALESCE(SUM(unique_consumers), 0)`,
      })
      .from(agentMetrics)
      .where(
        and(
          eq(agentMetrics.agentId, agent.id),
          gte(agentMetrics.timestamp, thirtyDaysAgo)
        )
      );

    const m = metrics[0];
    if (!m || Number(m.totalReqs) < MIN_CALLS_TO_QUALIFY) continue;

    const totalReqs = Number(m.totalReqs);
    const successReqs = Number(m.successReqs);
    const avgLatency = Number(m.avgLatency);
    const p95Latency = Number(m.p95Latency);
    const uniqueWallets = Number(m.uniqueWallets);

    const successRate = totalReqs > 0 ? (successReqs / totalReqs) * 100 : 0;
    const uptimeScore = successRate;
    const ratingScore = parseFloat(agent.ratingAvg ?? "0") * 20; // 0-5 → 0-100
    const speedScore = Math.max(0, 100 - avgLatency / 50);
    const volumeScore = Math.min(100, (totalReqs / 1000) * 100);

    // Weighted composite score
    const trustScore =
      ratingScore * 0.3 +
      uptimeScore * 0.25 +
      successRate * 0.2 +
      volumeScore * 0.15 +
      speedScore * 0.1;

    await db
      .update(agents)
      .set({
        trustScore: trustScore.toFixed(2),
        trustTier: computeTrustTier(trustScore),
        uptime30d: uptimeScore.toFixed(2),
        successRate30d: successRate.toFixed(2),
        p95LatencyMs: p95Latency,
        uniqueConsumers30d: uniqueWallets,
      })
      .where(eq(agents.id, agent.id));

    updated++;
  }

  console.log(`[trust-recalc] processed=${activeAgents.length} updated=${updated}`);
}
