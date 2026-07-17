import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";

/**
 * Creates a Supabase client for use inside Server Components, Route
 * Handlers, and Server Actions. Returns null when Supabase environment
 * variables are not configured so callers can fall back to local data.
 *
 * Cookie writes are wrapped in try/catch because Server Components cannot
 * mutate cookies — only Route Handlers and Server Actions can. This client
 * is ready to carry auth sessions once authentication is added in a future
 * sprint; no session handling happens yet.
 */
export async function createSupabaseServerClient() {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient<Database>(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component; session refresh happens elsewhere.
        }
      },
    },
  });
}
