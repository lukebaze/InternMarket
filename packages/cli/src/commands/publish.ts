/**
 * publish.ts — publish intern package to InternMarket marketplace
 * Uses Ink TUI for step-by-step publish progress display.
 * Falls back to ora spinners when --no-tui flag is set (CI mode).
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { buildPackage } from "../lib/packager.js";
import { readManifest, validateManifest } from "../lib/manifest-reader.js";
import { isAuthenticated } from "../lib/auth-store.js";
import { apiPost } from "../lib/api-client.js";
import { info, success, error, createSpinner } from "../lib/logger.js";

interface PublishOptions {
  changelog?: string;
  noTui?: boolean;
}

async function promptChangelog(): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Changelog (optional, press Enter to skip): ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

/** Publish using ora spinners (CI / --no-tui mode) */
async function publishWithSpinners(opts: PublishOptions): Promise<void> {
  const cwd = process.cwd();
  let manifest: ReturnType<typeof readManifest>;
  try {
    manifest = readManifest(cwd);
    const { valid, errors } = validateManifest(manifest);
    if (!valid) throw new Error(errors.join(", "));
  } catch (err) {
    error(`Invalid manifest: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const { slug, version } = manifest;
  const tarballName = `${slug}-${version}.internagent`;
  let tarballPath = path.join(cwd, tarballName);

  if (!fs.existsSync(tarballPath)) {
    const buildSpinner = createSpinner("Building package...");
    buildSpinner.start();
    try {
      ({ tarballPath } = await buildPackage(cwd));
      buildSpinner.succeed("Package built");
    } catch (err) {
      buildSpinner.fail(`Build failed: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  } else {
    info(`Using existing package: ${tarballName}`);
  }

  const changelog = opts.changelog ?? (await promptChangelog());
  const fileBuffer = fs.readFileSync(tarballPath);
  const filename = path.basename(tarballPath);

  const urlSpinner = createSpinner("Requesting upload URL...");
  urlSpinner.start();
  let uploadUrl: string;
  let packageKey: string;
  try {
    const res = await apiPost<{ uploadUrl: string; packageKey: string }>(
      "/upload/presigned",
      { filename, slug, version }
    );
    uploadUrl = res.uploadUrl;
    packageKey = res.packageKey;
    urlSpinner.succeed("Upload URL obtained");
  } catch (err) {
    urlSpinner.fail(`Failed to get upload URL: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const putSpinner = createSpinner("Uploading package...");
  putSpinner.start();
  try {
    const putRes = await fetch(uploadUrl!, {
      method: "PUT",
      body: fileBuffer,
      headers: { "Content-Type": "application/gzip" },
    });
    if (!putRes.ok) throw new Error(`HTTP ${putRes.status}`);
    putSpinner.succeed("Package uploaded");
  } catch (err) {
    putSpinner.fail(`Upload error: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const regSpinner = createSpinner("Registering version...");
  regSpinner.start();
  try {
    await apiPost(`/agents/${slug}/versions`, { packageKey: packageKey!, version, changelog });
    regSpinner.succeed("Version registered");
  } catch (err) {
    regSpinner.fail(`Registration failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  success(`Published ${slug}@${version}`);
}

/** Publish using Ink TUI (interactive mode) */
async function publishWithTUI(opts: PublishOptions): Promise<void> {
  const { renderApp } = await import("../ui/app-wrapper.js");
  const { PublishStatus } = await import("../ui/publish-status.js");

  const cwd = process.cwd();
  let manifest: ReturnType<typeof readManifest>;
  try {
    manifest = readManifest(cwd);
    const { valid, errors } = validateManifest(manifest);
    if (!valid) throw new Error(errors.join(", "));
  } catch (err) {
    error(`Invalid manifest: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const { slug, version } = manifest;

  // Collect changelog before TUI starts (needs stdin)
  const changelog = opts.changelog ?? (await promptChangelog());

  let packageSize = 0;
  let tarballPath = "";
  let uploadUrl = "";
  let packageKey = "";

  // Build
  await renderApp(PublishStatus, { step: "packaging", slug, version, packageSize: 0 });

  try {
    const tarballName = `${slug}-${version}.internagent`;
    const existing = path.join(cwd, tarballName);
    if (fs.existsSync(existing)) {
      tarballPath = existing;
      packageSize = fs.statSync(tarballPath).size;
    } else {
      const result = await buildPackage(cwd);
      tarballPath = result.tarballPath;
      packageSize = result.size;
    }
  } catch (err) {
    await renderApp(PublishStatus, {
      step: "error",
      slug,
      version,
      errorMsg: `Build failed: ${err instanceof Error ? err.message : String(err)}`,
    });
    process.exit(1);
  }

  const fileBuffer = fs.readFileSync(tarballPath);
  const filename = path.basename(tarballPath);

  // Upload
  await renderApp(PublishStatus, { step: "uploading", slug, version, packageSize });

  try {
    const res = await apiPost<{ uploadUrl: string; packageKey: string }>(
      "/upload/presigned",
      { filename, slug, version }
    );
    uploadUrl = res.uploadUrl;
    packageKey = res.packageKey;

    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: fileBuffer,
      headers: { "Content-Type": "application/gzip" },
    });
    if (!putRes.ok) throw new Error(`HTTP ${putRes.status}`);
  } catch (err) {
    await renderApp(PublishStatus, {
      step: "error",
      slug,
      version,
      errorMsg: `Upload failed: ${err instanceof Error ? err.message : String(err)}`,
    });
    process.exit(1);
  }

  // Register
  await renderApp(PublishStatus, { step: "registering", slug, version, packageSize });

  try {
    await apiPost(`/agents/${slug}/versions`, { packageKey, version, changelog });
  } catch (err) {
    await renderApp(PublishStatus, {
      step: "error",
      slug,
      version,
      errorMsg: `Registration failed: ${err instanceof Error ? err.message : String(err)}`,
    });
    process.exit(1);
  }

  await renderApp(PublishStatus, { step: "done", slug, version, packageSize });
}

export async function publishCmd(opts: PublishOptions): Promise<void> {
  if (!isAuthenticated()) {
    error("Not authenticated. Run: internmarket login");
    process.exit(1);
  }

  const useTUI = !opts.noTui && process.stdout.isTTY;
  if (useTUI) {
    await publishWithTUI(opts);
  } else {
    await publishWithSpinners(opts);
  }
}
