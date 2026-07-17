import { createClient } from "@supabase/supabase-js";
import { testPassword, testUsers, type TestRole } from "./auth";

function requiredEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} wajib diatur untuk E2E Supabase lokal.`);
  }

  return value;
}

export function createE2ESupabaseClient() {
  return createClient(
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requiredEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
    {
      auth: {
        persistSession: false,
      },
    },
  );
}

export async function signInE2EClient(role: TestRole) {
  const client = createE2ESupabaseClient();
  const { error } = await client.auth.signInWithPassword({
    email: testUsers[role],
    password: testPassword,
  });

  if (error) {
    throw error;
  }

  return client;
}

export async function cleanupE2EData() {
  const admin = await signInE2EClient("admin");

  await admin.from("plants").delete().like("slug", "e2e-%");
  await admin.from("plants").delete().like("local_name", "E2E-%");
  await admin
    .from("health_zones")
    .delete()
    .in("zone_code", [
      "khb-z90",
      "khb-z91",
      "khb-z92",
      "khb-z93",
      "khb-z94",
      "khb-z95",
      "khb-z96",
      "khb-z97",
      "khb-z98",
      "khb-z99",
    ]);
  await admin.from("health_zones").delete().like("slug", "e2e-%");
  await admin.auth.signOut();
}
