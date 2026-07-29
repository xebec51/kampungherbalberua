export type SupabaseRuntimeConfig = {
  url: string;
  publishableKey: string;
};

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
