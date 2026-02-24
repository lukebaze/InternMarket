import type { AgentCategory, PackageManifest } from "@repo/types";

const VALID_CATEGORIES: AgentCategory[] = [
  "marketing", "assistant", "copywriting", "coding",
  "pm", "trading", "social", "devops", "data", "design",
];

const VALID_PERMISSIONS = ["network", "filesystem:read", "filesystem:write", "shell", "env"];

// Dangerous permission combinations that warrant a warning
const DANGEROUS_COMBOS: Array<[string, string]> = [
  ["shell", "filesystem:write"],
  ["shell", "env"],
  ["shell", "network"],
];

const SLUG_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?(\+[a-zA-Z0-9.]+)?$/;

// Banned filename patterns — never allow in packages
const BANNED_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /^credentials\.json$/i,
  /private[-_]?key/i,
  /secret[-_]?key/i,
  /id_rsa$/i,
  /\.pem$/i,
  /\.p12$/i,
  /\.pfx$/i,
];

/** Max package size: 50 MB */
export const MAX_PACKAGE_SIZE_BYTES = 50 * 1024 * 1024;

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: PackageManifest;
}

/** Check if a filename matches any banned pattern. */
export function isBannedFile(filename: string): boolean {
  return BANNED_FILE_PATTERNS.some((re) => re.test(filename));
}

/** Validate declared permissions list. */
export function validatePermissions(permissions: string[]): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  for (const perm of permissions) {
    if (!VALID_PERMISSIONS.includes(perm)) {
      issues.push(`Unknown permission: '${perm}'. Allowed: ${VALID_PERMISSIONS.join(", ")}`);
    }
  }

  for (const [a, b] of DANGEROUS_COMBOS) {
    if (permissions.includes(a) && permissions.includes(b)) {
      issues.push(`Dangerous permission combo: '${a}' + '${b}' — requires manual review`);
    }
  }

  return { valid: issues.length === 0, issues };
}

/**
 * Validate a .internagent package manifest.json structure.
 * Returns errors (blocking) and warnings (non-blocking).
 */
export function validateManifest(raw: unknown): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { valid: false, errors: ["manifest.json must be a JSON object"], warnings: [] };
  }

  const data = raw as Record<string, unknown>;

  // Required string fields
  if (typeof data.name !== "string" || !data.name.trim()) {
    errors.push("'name' is required and must be a non-empty string");
  }
  if (typeof data.version !== "string" || !SEMVER_REGEX.test(data.version)) {
    errors.push("'version' must be a valid semver string (e.g. 1.0.0)");
  }
  if (typeof data.slug !== "string" || !SLUG_REGEX.test(data.slug)) {
    errors.push("'slug' must be lowercase alphanumeric with hyphens (e.g. my-agent)");
  }
  if (typeof data.description !== "string" || !data.description.trim()) {
    errors.push("'description' is required and must be a non-empty string");
  }
  if (typeof data.category !== "string" || !VALID_CATEGORIES.includes(data.category as AgentCategory)) {
    errors.push(`'category' must be one of: ${VALID_CATEGORIES.join(", ")}`);
  }

  // Author object
  if (!data.author || typeof data.author !== "object") {
    errors.push("'author' is required and must be an object with 'name'");
  } else {
    const author = data.author as Record<string, unknown>;
    if (typeof author.name !== "string" || !author.name.trim()) {
      errors.push("'author.name' is required");
    }
  }

  // Optional arrays
  if (data.tags !== undefined) {
    if (!Array.isArray(data.tags) || !data.tags.every((t: unknown) => typeof t === "string")) {
      errors.push("'tags' must be an array of strings");
    }
  }

  // Permissions — validate values and combos
  if (data.permissions !== undefined) {
    if (!Array.isArray(data.permissions) || !data.permissions.every((p: unknown) => typeof p === "string")) {
      errors.push("'permissions' must be an array of strings");
    } else {
      const { issues } = validatePermissions(data.permissions as string[]);
      // Unknown permissions = error, dangerous combos = warning
      for (const issue of issues) {
        if (issue.startsWith("Unknown")) errors.push(issue);
        else warnings.push(issue);
      }
    }
  }

  // Optional fields
  if (data.compatibleClaude !== undefined && typeof data.compatibleClaude !== "string") {
    errors.push("'compatibleClaude' must be a string (semver range)");
  }
  if (data.compatibleOpenClaw !== undefined && typeof data.compatibleOpenClaw !== "string") {
    warnings.push("'compatibleOpenClaw' should be a semver range string");
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  const manifest: PackageManifest = {
    name: data.name as string,
    version: data.version as string,
    slug: data.slug as string,
    author: data.author as PackageManifest["author"],
    description: data.description as string,
    category: data.category as AgentCategory,
    tags: (data.tags as string[]) ?? [],
    permissions: (data.permissions as string[]) ?? [],
    compatibleClaude: (data.compatibleClaude as string) ?? "*",
  };

  return { valid: true, errors: [], warnings, manifest };
}

/** Validate package file size against the 50MB limit. */
export function validatePackageSize(sizeBytes: number): { valid: boolean; error?: string } {
  if (sizeBytes > MAX_PACKAGE_SIZE_BYTES) {
    const mb = (sizeBytes / 1024 / 1024).toFixed(1);
    return { valid: false, error: `Package size ${mb}MB exceeds 50MB limit` };
  }
  return { valid: true };
}
