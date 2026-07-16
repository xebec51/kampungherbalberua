import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Creates a Supabase client for use inside Client Components. Not yet wired
 * into any page this sprint — plant pages read data via Server Components.
 * Returns null when Supabase environment variables are not configured.
 */
export function createSupabaseBrowserClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  return createBrowserClient<Database>(config.url, config.publishableKey);
}
