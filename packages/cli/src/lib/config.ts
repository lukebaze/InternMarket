import os from "os";
import path from "path";

/** Base API URL — override with INTERNMARKET_API_URL env var */
export const API_URL =
  process.env.INTERNMARKET_API_URL ?? "https://internmarket.dev/api";

/** ~/.internmarket/ — stores token, installed agent registry */
export const INTERNMARKET_DIR = path.join(os.homedir(), ".internmarket");

/** ~/.claude/ — global Claude config directory */
export const CLAUDE_GLOBAL_DIR = path.join(os.homedir(), ".claude");

/** ./.claude/ — project-local Claude config directory */
export const CLAUDE_LOCAL_DIR = path.join(process.cwd(), ".claude");

/** Max tarball size: 50 MB */
export const MAX_PACKAGE_SIZE = 50 * 1024 * 1024;
