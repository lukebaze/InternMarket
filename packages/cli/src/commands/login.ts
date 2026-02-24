/**
 * login.ts — authenticate with InternMarket via API token
 * Accepts --token flag or prompts user to paste token from web dashboard.
 */
import readline from "node:readline";
import { setToken, clearToken } from "../lib/auth-store.js";
import { apiGet } from "../lib/api-client.js";
import { success, error, info, createSpinner } from "../lib/logger.js";

interface LoginOptions {
  token?: string;
}

interface MeResponse {
  id: string;
  email?: string;
  username?: string;
}

async function promptToken(): Promise<string> {
  info("Visit your InternMarket dashboard to get an API token:");
  info("  https://internmarket.dev/settings/tokens");
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question("Paste your API token: ", (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

export async function loginCmd(opts: LoginOptions): Promise<void> {
  let token = opts.token?.trim();

  if (!token) {
    token = await promptToken();
  }

  if (!token) {
    error("No token provided.");
    process.exit(1);
  }

  // Store token so apiGet can use it for the verification call
  setToken(token);

  const spinner = createSpinner("Verifying token...");
  spinner.start();

  try {
    const me = await apiGet<MeResponse>("/auth/me");
    spinner.succeed("Token verified");
    const identity = me.username ?? me.email ?? me.id;
    success(`Logged in as ${identity}`);
  } catch (err) {
    clearToken();
    spinner.fail(`Token verification failed: ${err instanceof Error ? err.message : String(err)}`);
    process.exit(1);
  }
}
