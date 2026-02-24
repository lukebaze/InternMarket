/**
 * package-cmd.ts — build .internagent tarball from current directory
 * Named package-cmd to avoid collision with reserved "package" identifier.
 */
import fs from "node:fs";
import path from "node:path";
import { buildPackage } from "../lib/packager.js";
import { ensureKeys, signPackage } from "../lib/signer.js";
import { readManifest, validateManifest } from "../lib/manifest-reader.js";
import { info, success, error, createSpinner } from "../lib/logger.js";

export async function packageCmd(): Promise<void> {
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
  const buildSpinner = createSpinner(`Building ${slug}@${version}...`);
  buildSpinner.start();

  let tarballPath: string;
  let size: number;

  try {
    ({ tarballPath, size } = await buildPackage(cwd));
    buildSpinner.succeed(`Package built: ${path.basename(tarballPath)} (${size} bytes)`);
  } catch (err) {
    buildSpinner.fail(`Build failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  const signSpinner = createSpinner("Signing package...");
  signSpinner.start();

  try {
    const { privateKey } = ensureKeys();
    const signature = signPackage(tarballPath, privateKey);
    const sigPath = tarballPath.replace(/\.internagent$/, ".sig");
    fs.writeFileSync(sigPath, signature, "utf-8");
    signSpinner.succeed(`Signature written: ${path.basename(sigPath)}`);
  } catch (err) {
    signSpinner.fail(`Signing failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }

  info(`Run: internmarket publish  to upload to InternMarket`);
}
