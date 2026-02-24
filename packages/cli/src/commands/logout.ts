/**
 * logout.ts — clear stored InternMarket credentials
 */
import { clearToken } from "../lib/auth-store.js";
import { success } from "../lib/logger.js";

export async function logoutCmd(): Promise<void> {
  clearToken();
  success("Logged out");
}
