import { createDb } from "../lib/db";
import { agents, agentMetrics, ratings } from "@repo/db";
import { eq, sql, gte, and } from "drizzle-orm";
import { computeTrustTier } from "../lib/trust-tier-thresholds";
import { wilsonLowerBound } from "../lib/wilson-lower-bound";
import { computeUptime } from "../lib/uptime-calculator";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Hourly trust recalculation: computes composite trust score from 30-day metrics.
 * Runs AFTER metrics aggregation to use consolidated data.
 *
 * Weighted formula:
 *   rating(30%) + uptime(25%) + successRate(20%) + volume(15%) + speed(10%)
 *
 * Rating uses Wilson lower bound for confidence adjustment.
 * Uptime comes from health check pass rate, NOT request success rate.
 */
export async function handleTrustRecalc(env: { DATABASE_URL: string }) {
  const db = createDb(env.DATABASE_URL);
  const thirtyDaysAgo = new Date(Date.now() - THIRTY_DAYS_MS);

  const activeAgents = await db.query.agents.findMany({
    where: eq(agents.status, "active"),
  });

  // Batch-fetch rating counts for all active agents
  const ratingCounts = await db
    .select({
      agentId: ratings.agentId,
      count: sql<number>`COUNT(*)`,
    })
    .from(ratings)
    .groupBy(ratings.agentId);

  const ratingCountMap = new Map(ratingCounts.map((r) => [r.agentId, Number(r.count)]));

  let updated = 0;
  for (const agent of activeAgents) {
    const metrics = await db
      .select({
        totalReqs: sql<number>`COALESCE(SUM(total_requests), 0)`,
        successReqs: sql<number>`COALESCE(SUM(successful_requests), 0)`,
        p95Latency: sql<number>`COALESCE(MAX(p95_latency_ms), 0)`,
        uniqueWallets: sql<number>`COALESCE(SUM(unique_consumers), 0)`,
      })
      .from(agentMetrics)
      .where(and(eq(agentMetrics.agentId, agent.id), gte(agentMetrics.timestamp, thirtyDaysAgo)));

    const m = metrics[0];
    const totalReqs = Number(m?.totalReqs ?? 0);
    const successReqs = Number(m?.successReqs ?? 0);
    const p95Latency = Number(m?.p95Latency ?? 0);
    const uniqueWallets = Number(m?.uniqueWallets ?? 0);

    // Agents with 0 calls keep "new" tier
    if (totalReqs === 0) {
      if (agent.trustTier !== "new") {
        await db.update(agents).set({ trustTier: "new", trustScore: "0" }).where(eq(agents.id, agent.id));
      }
      continue;
    }

    const ratingCount = ratingCountMap.get(agent.id) ?? 0;
    const ratingAvg = parseFloat(agent.ratingAvg ?? "0");

    // Wilson lower bound dampens confidence for low review counts
    const ratingScore = wilsonLowerBound(ratingAvg, ratingCount) * 20; // 0-5 → 0-100
    // Uptime from health check probes, NOT request success
    const uptimeScore = computeUptime(agent.healthCheckTotal ?? 0, agent.healthCheckPassed ?? 0);
    const successRate = (successReqs / totalReqs) * 100;
    const volumeScore = Math.min(100, (totalReqs / 1000) * 100);
    const speedScore = Math.max(0, 100 - p95Latency / 50);

    const trustScore =
      ratingScore * 0.3 +
      uptimeScore * 0.25 +
      successRate * 0.2 +
      volumeScore * 0.15 +
      speedScore * 0.1;

    const trustTier = computeTrustTier(trustScore, totalReqs);

    await db.update(agents).set({
      trustScore: trustScore.toFixed(2),
      trustTier,
      ratingCount,
      uptime30d: uptimeScore.toFixed(2),
      successRate30d: successRate.toFixed(2),
      p95LatencyMs: p95Latency,
      uniqueConsumers30d: uniqueWallets,
    }).where(eq(agents.id, agent.id));

    updated++;
  }

  console.log(`[trust-recalc] processed=${activeAgents.length} updated=${updated}`);
}
