import { agentMetrics } from "@repo/db";
import type { GatewayDb } from "../lib/db";

interface RequestMetric {
  agentId: string;
  latencyMs: number;
  success: boolean;
  consumerWallet: string;
}

// Record a per-request metric row in hourly buckets.
// MVP: one row per request — aggregate queries handle rollups.
export async function recordMetric(db: GatewayDb, metric: RequestMetric) {
  const hourBucket = new Date();
  hourBucket.setMinutes(0, 0, 0); // Round down to current hour

  await db.insert(agentMetrics).values({
    agentId: metric.agentId,
    timestamp: hourBucket,
    totalRequests: 1,
    successfulRequests: metric.success ? 1 : 0,
    failedRequests: metric.success ? 0 : 1,
    avgLatencyMs: metric.latencyMs,
    p95LatencyMs: metric.latencyMs,
    uniqueConsumers: 1,
  });
}
