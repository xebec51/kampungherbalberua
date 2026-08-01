import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types";
import { testPassword, testUsers, type TestRole } from "./auth";

function readFirstEnv(names: string[]) {
  for (const name of names) {
    const value = process.env[name];

    if (value && value.trim().length > 0) {
      return value.trim();
    }
  }

  return undefined;
}

function requiredFirstEnv(names: string[]) {
  const value = readFirstEnv(names);

  if (!value) {
    throw new Error(`${names.join(" atau ")} wajib diatur untuk E2E Supabase lokal.`);
  }

  return value;
}

export function hasSupabaseE2EEnv() {
  return Boolean(
    readFirstEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]) &&
      readFirstEnv([
        "SUPABASE_ANON_KEY",
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      ]),
  );
}

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error("E2E tidak boleh memakai Supabase remote.");
  }
}

function getSupabaseUrl() {
  const url = requiredFirstEnv(["SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_URL"]);
  assertLocalSupabaseUrl(url);
  return url;
}

function getAnonKey() {
  return requiredFirstEnv([
    "SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  ]);
}

function optionalServiceRoleKey() {
  const value = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!value || value.trim().length === 0) {
    return undefined;
  }

  return value.trim();
}

export function createE2ESupabaseClient() {
  return createClient<Database>(getSupabaseUrl(), getAnonKey(), {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function createLocalAdminClient() {
  const serviceRoleKey = optionalServiceRoleKey();

  if (!serviceRoleKey) {
    return null;
  }

  return createClient<Database>(getSupabaseUrl(), serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
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

async function deleteE2EData(client: SupabaseClient<Database>) {
  const plantSlugCleanup = await client.from("plants").delete().like("slug", "e2e-%");
  if (plantSlugCleanup.error) {
    throw plantSlugCleanup.error;
  }

  const plantNameCleanup = await client
    .from("plants")
    .delete()
    .like("local_name", "E2E-%");
  if (plantNameCleanup.error) {
    throw plantNameCleanup.error;
  }

  const zoneCodeCleanup = await client
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
  if (zoneCodeCleanup.error) {
    throw zoneCodeCleanup.error;
  }

  const zoneSlugCleanup = await client
    .from("health_zones")
    .delete()
    .like("slug", "e2e-%");
  if (zoneSlugCleanup.error) {
    throw zoneSlugCleanup.error;
  }

  const streetQrCleanup = await client
    .from("streets")
    .delete()
    .like("qr_key", "e2e-%");
  if (streetQrCleanup.error) {
    throw streetQrCleanup.error;
  }

  const streetSlugCleanup = await client
    .from("streets")
    .delete()
    .like("slug", "e2e-%");
  if (streetSlugCleanup.error) {
    throw streetSlugCleanup.error;
  }
}

export async function cleanupE2EData(options?: { failOnError?: boolean }) {
  const failOnError = options?.failOnError ?? true;

  try {
    const localAdmin = createLocalAdminClient();

    if (localAdmin) {
      await deleteE2EData(localAdmin);
      return;
    }

    const admin = await signInE2EClient("admin");
    await deleteE2EData(admin);
    await admin.auth.signOut();
  } catch (error) {
    if (failOnError) {
      throw error;
    }

    const message = error instanceof Error ? error.message : "error tidak dikenal";
    console.warn(`Cleanup E2E dilewati setelah test: ${message}`);
  }
}
