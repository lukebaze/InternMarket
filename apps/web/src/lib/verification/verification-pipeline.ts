/**
 * verification-pipeline.ts — Orchestrates the full security verification pipeline:
 * pending -> scanning -> verified | rejected
 *
 * Steps:
 *  1. Platform counter-signature
 *  2. VirusTotal URL scan
 *  3. Update agent verificationStatus in DB
 */
import { createNodeClient, agents } from "@repo/db";
import { eq } from "drizzle-orm";
import { counterSign } from "./platform-signer";
import { scanPackageUrl } from "./virustotal-scanner";

export interface VerificationResult {
  status: "verified" | "rejected" | "pending";
  issues: string[];
  scanId?: string;
}

function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set");
  return createNodeClient(url);
}

async function setStatus(agentId: string, status: string) {
  const db = getDb();
  await db
    .update(agents)
    .set({ verificationStatus: status, updatedAt: new Date() })
    .where(eq(agents.id, agentId));
}

/**
 * Run full verification pipeline for a published package.
 * This is async fire-and-forget from the publish route (runs server-side).
 *
 * @param agentId - DB uuid of the agent
 * @param packageUrl - Supabase storage key / public URL of the package
 * @param creatorSignature - base64 Ed25519 sig from CLI (empty string if not provided)
 */
export async function runVerificationPipeline(
  agentId: string,
  packageUrl: string,
  creatorSignature: string = "",
): Promise<VerificationResult> {
  const issues: string[] = [];

  try {
    // 1. Set status to scanning
    await setStatus(agentId, "scanning");

    // 2. Platform counter-signature (best-effort — doesn't fail pipeline)
    const sigBundle = counterSign(packageUrl, creatorSignature);
    if (!sigBundle) {
      issues.push("Platform signing key not configured — counter-signature skipped");
    }

    // 3. VirusTotal scan
    const scanResult = await scanPackageUrl(packageUrl);

    if (scanResult.status === "malicious") {
      issues.push(`VirusTotal: ${scanResult.positives}/${scanResult.total} engines flagged malicious`);
      await setStatus(agentId, "rejected");
      return { status: "rejected", issues, scanId: scanResult.scanId };
    }

    if (scanResult.status === "suspicious") {
      issues.push(`VirusTotal: ${scanResult.positives}/${scanResult.total} engines flagged suspicious — queued for review`);
      // Suspicious goes to pending (human review) not outright rejected
      await setStatus(agentId, "pending");
      return { status: "pending", issues, scanId: scanResult.scanId };
    }

    if (scanResult.status === "error") {
      issues.push("VirusTotal scan encountered an error — marking pending for retry");
      await setStatus(agentId, "pending");
      return { status: "pending", issues, scanId: scanResult.scanId };
    }

    // Clean or unconfigured VT: mark verified
    await setStatus(agentId, "verified");
    return { status: "verified", issues, scanId: scanResult.scanId };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    issues.push(`Pipeline error: ${msg}`);
    // Revert to pending on unexpected failure
    try {
      await setStatus(agentId, "pending");
    } catch {
      // best-effort
    }
    return { status: "pending", issues };
  }
}
