import fs from "fs";
import path from "path";
import { INTERNMARKET_DIR } from "./config.js";

export interface InstalledAgent {
  version: string;
  installedAt: string;
  path: string;
  scope: "global" | "local";
}

const STORE_FILE = path.join(INTERNMARKET_DIR, "installed.json");

/** Read installed.json, returning parsed map or empty object on error */
export function getInstalled(): Record<string, InstalledAgent> {
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(raw) as Record<string, InstalledAgent>;
  } catch {
    return {};
  }
}

/** Persist the installed map to disk */
function saveInstalled(data: Record<string, InstalledAgent>): void {
  fs.mkdirSync(INTERNMARKET_DIR, { recursive: true });
  fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
}

/** Add or overwrite an installed agent entry */
export function addInstalled(slug: string, data: InstalledAgent): void {
  const store = getInstalled();
  store[slug] = data;
  saveInstalled(store);
}

/** Remove an installed agent entry */
export function removeInstalled(slug: string): void {
  const store = getInstalled();
  delete store[slug];
  saveInstalled(store);
}

/** Return true if agent is tracked as installed */
export function isInstalled(slug: string): boolean {
  return slug in getInstalled();
}
