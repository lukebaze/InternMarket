/**
 * packager.ts — builds a .internagent tar.gz from a project directory
 * Reads manifest.json, validates it, creates a compressed archive.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { create as tarCreate } from "tar";
import { MAX_PACKAGE_SIZE } from "./config.js";
import { readManifest, validateManifest } from "./manifest-reader.js";

export interface PackageBuildResult {
  tarballPath: string;
  sha256: string;
  size: number;
}

const EXCLUDE_TOPS = new Set(["node_modules", ".git", "dist"]);

/**
 * Build a .internagent package from the given directory.
 * Outputs {slug}-{version}.internagent in the current working directory.
 */
export async function buildPackage(dir: string): Promise<PackageBuildResult> {
  const manifest = readManifest(dir);
  const { valid, errors } = validateManifest(manifest);
  if (!valid) {
    throw new Error(`Invalid manifest:\n  ${errors.join("\n  ")}`);
  }

  const { slug, version } = manifest;
  const outputName = `${slug}-${version}.internagent`;
  const outputPath = path.join(process.cwd(), outputName);

  // Build tar.gz excluding common non-distributable top-level dirs
  await tarCreate(
    {
      gzip: true,
      file: outputPath,
      cwd: dir,
      filter: (filePath: string) => {
        const top = filePath.split(path.sep)[0];
        if (top && EXCLUDE_TOPS.has(top)) return false;
        if (filePath.endsWith(".internagent")) return false;
        return true;
      },
    },
    ["."]
  );

  const fileBuffer = fs.readFileSync(outputPath);
  const size = fileBuffer.length;

  if (size > MAX_PACKAGE_SIZE) {
    fs.unlinkSync(outputPath);
    throw new Error(
      `Package size ${size} bytes exceeds the 50 MB limit`
    );
  }

  const sha256 = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  return { tarballPath: outputPath, sha256, size };
}
