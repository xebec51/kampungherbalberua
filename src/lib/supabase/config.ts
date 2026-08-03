import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export type SupabaseRuntimeConfig = {
  url: string;
  publishableKey: string;
};

const defaultSupabaseFetchTimeoutMs = 3_000;

function readEnv(name: string) {
  const value = process.env[name];
  return value && value.trim().length > 0 ? value.trim() : undefined;
}

function readFirstEnv(names: string[]) {
  for (const name of names) {
    const value = readEnv(name);

    if (value) {
      return value;
    }
  }

  return undefined;
}

/**
 * Reads Supabase environment variables without throwing so public builds and
 * pages keep working before a Supabase project is connected.
 */
export function getSupabaseConfig(): SupabaseRuntimeConfig | null {
  const url = readFirstEnv(["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"]);
  const publishableKey = readFirstEnv([
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_ANON_KEY",
  ]);

  if (!url || !publishableKey) {
    return null;
  }

  return { url, publishableKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseConfig() !== null;
}

/**
 * Anonymous (no-cookies) Supabase client for public data reads that need to
 * be cacheable with unstable_cache -- cookie-aware clients (createSupabaseServerClient)
 * call next/headers' cookies(), which unstable_cache forbids.
 */
export function createSupabasePublicClient(config: SupabaseRuntimeConfig) {
  return createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

export async function supabaseFetchWithTimeout(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const rawTimeout = Number(process.env.SUPABASE_FETCH_TIMEOUT_MS);
  const timeoutMs =
    Number.isFinite(rawTimeout) && rawTimeout > 0
      ? rawTimeout
      : defaultSupabaseFetchTimeoutMs;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: init?.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}
