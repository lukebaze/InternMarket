import fs from "fs";
import path from "path";
import semver from "semver";

export interface PackageManifest {
  name: string;
  version: string;
  slug: string;
  author: {
    name: string;
    clerkId?: string;
    github?: string;
  };
  description: string;
  category: string;
  tags: string[];
  permissions: string[];
  compatibleOpenClaw: string;
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;

/** Read and parse manifest.json from the given directory. Throws if missing. */
export function readManifest(dir: string): PackageManifest {
  const manifestPath = path.join(dir, "manifest.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error(`manifest.json not found in ${dir}`);
  }
  const raw = fs.readFileSync(manifestPath, "utf8");
  return JSON.parse(raw) as PackageManifest;
}

/** Validate required manifest fields. Returns { valid, errors }. */
export function validateManifest(raw: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  const m = raw as Partial<PackageManifest>;

  if (!m.name) errors.push("Missing required field: name");
  if (!m.version || !semver.valid(m.version)) errors.push("Missing or invalid semver: version");
  if (!m.slug || !SLUG_RE.test(m.slug)) errors.push("Missing or invalid slug (must match ^[a-z0-9][a-z0-9-]*[a-z0-9]$)");
  if (!m.author?.name) errors.push("Missing required field: author.name");
  if (!m.description) errors.push("Missing required field: description");
  if (!m.category) errors.push("Missing required field: category");

  return { valid: errors.length === 0, errors };
}
