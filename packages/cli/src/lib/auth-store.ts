import fs from "fs";
import path from "path";
import { INTERNMARKET_DIR } from "./config.js";

const CONFIG_FILE = path.join(INTERNMARKET_DIR, "config.json");

/** Ensure ~/.internmarket/ exists */
function ensureDir(): void {
  fs.mkdirSync(INTERNMARKET_DIR, { recursive: true });
}

/** Read config.json, return parsed object or empty object on error */
function readConfig(): Record<string, unknown> {
  try {
    const raw = fs.readFileSync(CONFIG_FILE, "utf8");
    return JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** Write config object to config.json with chmod 600 */
function writeConfig(data: Record<string, unknown>): void {
  ensureDir();
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(data, null, 2), "utf8");
  fs.chmodSync(CONFIG_FILE, 0o600);
}

/** Return stored auth token or null if not found */
export function getToken(): string | null {
  const cfg = readConfig();
  return typeof cfg.token === "string" ? cfg.token : null;
}

/** Persist auth token to config.json */
export function setToken(token: string): void {
  const cfg = readConfig();
  cfg.token = token;
  writeConfig(cfg);
}

/** Remove token from config.json */
export function clearToken(): void {
  const cfg = readConfig();
  delete cfg.token;
  writeConfig(cfg);
}

/** Returns true if a token exists */
export function isAuthenticated(): boolean {
  return !!getToken();
}
