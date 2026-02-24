import { Command } from "commander";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import semver from "semver";
import { apiGet } from "../lib/api-client.js";
import { MAX_PACKAGE_SIZE } from "../lib/config.js";
import { extractPackage } from "../lib/extractor.js";
import { installAgent } from "../lib/installer.js";
import { createSpinner, info, success, warn } from "../lib/logger.js";
import { addInstalled, getInstalled } from "../lib/metadata-store.js";

interface AgentDetail {
  name: string;
  slug: string;
  currentVersion: string;
  checksum?: string;
}

interface DownloadMeta {
  url: string;
  checksum?: string;
}

async function downloadToTemp(url: string, slug: string): Promise<string> {
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
  const buf = await res.arrayBuffer();
  if (buf.byteLength > MAX_PACKAGE_SIZE) {
    throw new Error(`Package exceeds ${MAX_PACKAGE_SIZE / 1024 / 1024}MB limit`);
  }
  const tmpFile = path.join(os.tmpdir(), `internmarket-${slug}-${Date.now()}.tar.gz`);
  fs.writeFileSync(tmpFile, Buffer.from(buf));
  return tmpFile;
}

function sha256File(filePath: string): string {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

async function updateOne(
  slug: string,
  installedVersion: string,
  targetDir: string,
  scope: "global" | "local"
): Promise<"updated" | "skipped"> {
  const agent = await apiGet<AgentDetail>(`/agents/${slug}`);
  const latest = agent.currentVersion;
  if (!semver.gt(latest, installedVersion)) return "skipped";

  const meta = await apiGet<DownloadMeta>(`/agents/${slug}/download?version=${latest}`);
  const tmpFile = await downloadToTemp(meta.url, slug);

  const expectedChecksum = meta.checksum ?? agent.checksum;
  if (expectedChecksum) {
    const actual = sha256File(tmpFile);
    if (actual !== expectedChecksum) {
      fs.rmSync(tmpFile, { force: true });
      throw new Error(`Checksum mismatch for ${slug}`);
    }
  }

  const extractDir = path.join(os.tmpdir(), `internmarket-${slug}-${Date.now()}`);
  await extractPackage(tmpFile, extractDir);
  fs.rmSync(tmpFile, { force: true });

  await installAgent(extractDir, targetDir, slug);
  fs.rmSync(extractDir, { recursive: true, force: true });

  addInstalled(slug, { version: latest, installedAt: new Date().toISOString(), path: targetDir, scope });
  return "updated";
}

/** Update one or all agents. Used by both Commander command and lazy entry point. */
export async function updateCmd(slugArg?: string): Promise<void> {
  const store = getInstalled();
  const targets = slugArg
    ? slugArg in store
      ? [slugArg]
      : (warn(`Intern "${slugArg}" is not installed.`), [] as string[])
    : Object.keys(store);

  if (targets.length === 0) {
    info("No interns to update.");
    return;
  }

  let updated = 0;
  let skipped = 0;

  for (const slug of targets) {
    const entry = store[slug];
    const spinner = createSpinner(`Checking ${slug}...`).start();
    try {
      const result = await updateOne(slug, entry.version, entry.path, entry.scope);
      spinner.stop();
      if (result === "updated") { success(`Updated intern ${slug}`); updated++; }
      else { info(`${slug} is already up to date.`); skipped++; }
    } catch (err) {
      spinner.stop();
      warn(`Failed to update intern ${slug}: ${(err as Error).message}`);
      skipped++;
    }
  }

  console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
}

/** Commander Command object (used when registering via addCommand) */
export const updateCommand = new Command("update")
  .description("Update one or all installed interns to latest versions")
  .argument("[slug]", "Intern slug to update (omit to update all)")
  .action(async (slugArg?: string) => {
    await updateCmd(slugArg);
  });
