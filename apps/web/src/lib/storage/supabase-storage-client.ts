/**
 * supabase-storage-client.ts — singleton Supabase client for server-side storage ops.
 * Uses service role key — NEVER expose to client side.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

/** Get singleton Supabase client (server-side only). */
export function getStorageClient(): SupabaseClient {
  if (_client) return _client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars"
    );
  }

  _client = createClient(url, key, {
    auth: { persistSession: false },
  });

  return _client;
}

/** Bucket names used across the app */
export const PACKAGES_BUCKET = "packages";
export const THUMBNAILS_BUCKET = "thumbnails";
