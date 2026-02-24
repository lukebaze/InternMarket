/**
 * virustotal-scanner.ts — VirusTotal API v3 integration for package scanning.
 * Free tier: 4 requests/min, 500/day. Implements upload + poll pattern.
 * Requires VIRUSTOTAL_API_KEY env var.
 */

const VT_BASE = "https://www.virustotal.com/api/v3";
const POLL_INTERVAL_MS = 15_000; // 15s between polls
const MAX_POLLS = 12; // max 3 min wait

export interface ScanResult {
  scanId: string;
  status: "clean" | "malicious" | "suspicious" | "pending" | "error";
  positives: number;
  total: number;
  permalink?: string;
}

function getApiKey(): string {
  const key = process.env.VIRUSTOTAL_API_KEY;
  if (!key) throw new Error("VIRUSTOTAL_API_KEY not configured");
  return key;
}

/**
 * Upload a package URL to VirusTotal for scanning using the URL analysis endpoint.
 * This avoids re-downloading the file through our server.
 * @returns analysis ID for polling
 */
export async function submitUrlForScan(packageUrl: string): Promise<string> {
  const apiKey = getApiKey();

  const res = await fetch(`${VT_BASE}/urls`, {
    method: "POST",
    headers: {
      "x-apikey": apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `url=${encodeURIComponent(packageUrl)}`,
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`VirusTotal submit failed (${res.status}): ${body}`);
  }

  const data = await res.json() as { data: { id: string } };
  return data.data.id;
}

/**
 * Poll VirusTotal for analysis results.
 * @param analysisId - returned from submitUrlForScan
 */
export async function pollScanResult(analysisId: string): Promise<ScanResult> {
  const apiKey = getApiKey();

  for (let attempt = 0; attempt < MAX_POLLS; attempt++) {
    if (attempt > 0) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
    }

    const res = await fetch(`${VT_BASE}/analyses/${analysisId}`, {
      headers: { "x-apikey": apiKey },
    });

    if (!res.ok) {
      throw new Error(`VirusTotal poll failed (${res.status})`);
    }

    const data = await res.json() as {
      data: {
        attributes: {
          status: string;
          stats: { malicious: number; suspicious: number; undetected: number; harmless: number };
          results?: Record<string, unknown>;
        };
        links?: { item?: string };
      };
    };

    const { status, stats } = data.data.attributes;

    if (status === "queued" || status === "in-progress") {
      continue; // keep polling
    }

    const total = stats.malicious + stats.suspicious + stats.undetected + stats.harmless;
    const positives = stats.malicious + stats.suspicious;

    let scanStatus: ScanResult["status"] = "clean";
    if (stats.malicious > 0) scanStatus = "malicious";
    else if (stats.suspicious > 2) scanStatus = "suspicious";

    return {
      scanId: analysisId,
      status: scanStatus,
      positives,
      total,
      permalink: data.data.links?.item,
    };
  }

  // Timed out polling — return pending
  return { scanId: analysisId, status: "pending", positives: 0, total: 0 };
}

/**
 * Full scan flow: submit URL then poll for result.
 * Returns error result if VT is not configured (allows non-blocking deploys).
 */
export async function scanPackageUrl(packageUrl: string): Promise<ScanResult> {
  try {
    const analysisId = await submitUrlForScan(packageUrl);
    return await pollScanResult(analysisId);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("VIRUSTOTAL_API_KEY not configured")) {
      return { scanId: "unconfigured", status: "pending", positives: 0, total: 0 };
    }
    return { scanId: "error", status: "error", positives: 0, total: 0 };
  }
}
