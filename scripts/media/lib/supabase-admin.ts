import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import { loadMediaImportEnv } from "./env.ts";

export function createMediaAdminClient() {
  const env = loadMediaImportEnv();

  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SECRET_KEY, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}
