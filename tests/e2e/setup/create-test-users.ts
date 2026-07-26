import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types";

const testPassword = "TestPassword123!";

const testUsers = [
  {
    id: "40000000-0000-0000-0000-000000000001",
    displayName: "E2E Viewer",
    email: "viewer@test.invalid",
    role: "viewer",
  },
  {
    id: "40000000-0000-0000-0000-000000000002",
    displayName: "E2E Editor",
    email: "editor@test.invalid",
    role: "editor",
  },
  {
    id: "40000000-0000-0000-0000-000000000003",
    displayName: "E2E Validator",
    email: "validator@test.invalid",
    role: "validator",
  },
  {
    id: "40000000-0000-0000-0000-000000000004",
    displayName: "E2E Admin",
    email: "admin@test.invalid",
    role: "admin",
  },
] as const;

type RequiredEnvName =
  | "SUPABASE_URL"
  | "SUPABASE_ANON_KEY"
  | "SUPABASE_SERVICE_ROLE_KEY";

function requiredEnv(name: RequiredEnvName) {
  const value = process.env[name];

  if (!value || value.trim().length === 0) {
    throw new Error(`${name} wajib diatur dari Supabase lokal.`);
  }

  return value.trim();
}

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error("Setup user E2E hanya boleh memakai Supabase lokal.");
  }

  return url.toString().replace(/\/$/, "");
}

async function ensureAuthUser(
  admin: SupabaseClient<Database>,
  user: (typeof testUsers)[number],
) {
  const attributes = {
    id: user.id,
    email: user.email,
    password: testPassword,
    email_confirm: true,
    role: "authenticated",
    user_metadata: {
      display_name: user.displayName,
    },
    app_metadata: {
      provider: "email",
      providers: ["email"],
    },
  };

  const existing = await admin.auth.admin.getUserById(user.id);

  if (existing.data.user) {
    const { error } = await admin.auth.admin.updateUserById(user.id, attributes);

    if (error) {
      throw error;
    }

    return;
  }

  const { error } = await admin.auth.admin.createUser(attributes);

  if (error) {
    throw error;
  }
}

async function ensureProfiles(admin: SupabaseClient<Database>) {
  const { error } = await admin.from("profiles").upsert(
    testUsers.map((user) => ({
      display_name: user.displayName,
      id: user.id,
      is_active: true,
      role: user.role,
    })),
    { onConflict: "id" },
  );

  if (error) {
    throw error;
  }
}

async function preflightLogin(supabaseUrl: string, anonKey: string) {
  const client = createClient(supabaseUrl, anonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data, error } = await client.auth.signInWithPassword({
    email: "admin@test.invalid",
    password: testPassword,
  });

  if (error || !data.user) {
    throw error ?? new Error("Preflight login admin E2E gagal.");
  }

  await client.auth.signOut();
}

async function main() {
  const supabaseUrl = assertLocalSupabaseUrl(requiredEnv("SUPABASE_URL"));
  const anonKey = requiredEnv("SUPABASE_ANON_KEY");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const admin = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  for (const user of testUsers) {
    await ensureAuthUser(admin, user);
  }

  await ensureProfiles(admin);
  await preflightLogin(supabaseUrl, anonKey);
  console.log("User Auth E2E lokal siap.");
}

await main();
