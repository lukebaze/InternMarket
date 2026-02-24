/**
 * install.ts — install an intern from InternMarket
 * Uses Ink TUI for interactive install flow (permissions → download → done).
 * Falls back to ora spinners when --no-tui flag is set (CI mode).
 */
import { Command } from "commander";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import { apiGet } from "../lib/api-client.js";
import { CLAUDE_GLOBAL_DIR, CLAUDE_LOCAL_DIR, MAX_PACKAGE_SIZE } from "../lib/config.js";
import { extractPackage } from "../lib/extractor.js";
import { installAgent } from "../lib/installer.js";
import { createSpinner, error, success } from "../lib/logger.js";
import { addInstalled } from "../lib/metadata-store.js";

interface AgentDetail {
  name: string;
  slug: string;
  currentVersion: string;
  checksum?: string;
  creator?: string;
  verified?: boolean;
  permissions?: string[];
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

/** Install using ora spinners (CI / --no-tui mode) */
async function installWithSpinners(
  slugArg: string,
  opts: { local?: boolean; yes?: boolean }
): Promise<void> {
  const [slug, version] = slugArg.split("@");
  const targetDir = opts.local ? CLAUDE_LOCAL_DIR : CLAUDE_GLOBAL_DIR;
  const spinner = createSpinner(`Resolving ${slug}...`).start();

  try {
    const agent = await apiGet<AgentDetail>(`/agents/${slug}`);
    const resolvedVersion = version ?? agent.currentVersion;
    spinner.text = `Downloading ${agent.name}@${resolvedVersion}...`;

    const meta = await apiGet<DownloadMeta>(`/agents/${slug}/download?version=${resolvedVersion}`);
    const tmpFile = await downloadToTemp(meta.url, slug);

    const expectedChecksum = meta.checksum ?? agent.checksum;
    if (expectedChecksum) {
      spinner.text = "Verifying checksum...";
      const actual = sha256File(tmpFile);
      if (actual !== expectedChecksum) {
        fs.rmSync(tmpFile, { force: true });
        throw new Error(`Checksum mismatch. Expected ${expectedChecksum}, got ${actual}`);
      }
    }

    spinner.text = "Extracting...";
    const extractDir = path.join(os.tmpdir(), `internmarket-${slug}-${Date.now()}`);
    await extractPackage(tmpFile, extractDir);
    fs.rmSync(tmpFile, { force: true });

    spinner.text = "Installing...";
    await installAgent(extractDir, targetDir, slug);
    fs.rmSync(extractDir, { recursive: true, force: true });

    addInstalled(slug, {
      version: resolvedVersion,
      installedAt: new Date().toISOString(),
      path: targetDir,
      scope: opts.local ? "local" : "global",
    });

    spinner.stop();
    success(`Installed ${agent.name}@${resolvedVersion}`);
  } catch (err) {
    spinner.stop();
    error((err as Error).message);
    process.exit(1);
  }
}

/** Install using Ink TUI wizard (interactive mode) */
async function installWithTUI(
  slugArg: string,
  opts: { local?: boolean; yes?: boolean }
): Promise<void> {
  const { renderApp } = await import("../ui/app-wrapper.js");
  const { InstallWizard } = await import("../ui/install-wizard.js");

  const [slug, version] = slugArg.split("@");
  const targetDir = opts.local ? CLAUDE_LOCAL_DIR : CLAUDE_GLOBAL_DIR;

  // Resolve agent info first (before TUI)
  let agent: AgentDetail;
  try {
    agent = await apiGet<AgentDetail>(`/agents/${slug}`);
  } catch (err) {
    error(`Could not resolve intern "${slug}": ${(err as Error).message}`);
    process.exit(1);
  }

  const resolvedVersion = version ?? agent.currentVersion;
  const permissions = agent.permissions ?? [];

  // State shared between TUI renders
  let wizardState = {
    step: (opts.yes || permissions.length === 0 ? "resolving" : "permissions") as
      import("../ui/install-wizard.js").InstallStep,
    internName: agent.name,
    slug,
    version: resolvedVersion,
    creator: agent.creator,
    verified: agent.verified,
    permissions,
    downloadPercent: 0,
  };

  // If we need permission confirmation, show the checklist first
  if (!opts.yes && permissions.length > 0) {
    let accepted = false;
    await renderApp(InstallWizard, {
      ...wizardState,
      onPermissionResult: (result: boolean) => {
        accepted = result;
      },
    });
    if (!accepted) {
      error("Installation cancelled — permissions not accepted.");
      process.exit(1);
    }
  }

  // Now run the actual install steps, rendering TUI updates along the way
  let currentState = { ...wizardState, step: "resolving" as import("../ui/install-wizard.js").InstallStep };

  try {
    // Fetch download URL
    const meta = await apiGet<DownloadMeta>(`/agents/${slug}/download?version=${resolvedVersion}`);

    currentState = { ...currentState, step: "downloading", downloadPercent: 0 };
    const tmpFile = await downloadToTemp(meta.url, slug);
    currentState = { ...currentState, downloadPercent: 100 };

    const expectedChecksum = meta.checksum ?? agent.checksum;
    if (expectedChecksum) {
      currentState = { ...currentState, step: "verifying" };
      const actual = sha256File(tmpFile);
      if (actual !== expectedChecksum) {
        fs.rmSync(tmpFile, { force: true });
        throw new Error(`Checksum mismatch. Expected ${expectedChecksum}, got ${actual}`);
      }
    }

    currentState = { ...currentState, step: "extracting" };
    const extractDir = path.join(os.tmpdir(), `internmarket-${slug}-${Date.now()}`);
    await extractPackage(tmpFile, extractDir);
    fs.rmSync(tmpFile, { force: true });

    currentState = { ...currentState, step: "installing" };
    await installAgent(extractDir, targetDir, slug);
    fs.rmSync(extractDir, { recursive: true, force: true });

    addInstalled(slug, {
      version: resolvedVersion,
      installedAt: new Date().toISOString(),
      path: targetDir,
      scope: opts.local ? "local" : "global",
    });

    await renderApp(InstallWizard, { ...currentState, step: "done" });
  } catch (err) {
    await renderApp(InstallWizard, {
      ...currentState,
      step: "error",
      errorMsg: (err as Error).message,
    });
    process.exit(1);
  }
}

/** Install intern by slug[@version]. Used by both Commander command and lazy entry point. */
export async function installCmd(
  slugArg: string,
  opts: { local?: boolean; yes?: boolean; noTui?: boolean } = {}
): Promise<void> {
  const useTUI = !opts.noTui && process.stdout.isTTY;
  if (useTUI) {
    await installWithTUI(slugArg, opts);
  } else {
    await installWithSpinners(slugArg, opts);
  }
}

/** Commander Command object (used when registering via addCommand) */
export const installCommand = new Command("install")
  .description("Install an intern from InternMarket")
  .argument("<slug[@version]>", "Intern slug, optionally with @version")
  .option("--local", "Install into local .claude/ instead of global ~/.claude/")
  .option("--yes", "Skip confirmation prompts")
  .option("--no-tui", "Disable interactive TUI (for CI environments)")
  .action(async (slugArg: string, opts: { local?: boolean; yes?: boolean; noTui?: boolean }) => {
    await installCmd(slugArg, opts);
  });
