// Idempotent local/CI storage bucket bootstrap. supabase db reset wipes
// storage buckets along with the database, and no migration/seed creates
// them (only RLS policies referencing bucket_id = 'media-public'/
// 'media-originals' exist, assuming the buckets are already there) -- so
// this must run after every local or CI db reset, before any test that
// uploads real files. Reuses bootstrapMediaBuckets() (same function the
// remote Wikimedia import pipeline uses) so the bucket spec (public/private,
// allowed mime types, file size limit) never drifts from the source of
// truth in scripts/media/lib/storage.ts.
//
// Usage:
//   node --experimental-strip-types scripts/media/ensure-local-buckets.ts
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/database.types.ts";
import { bootstrapMediaBuckets, MEDIA_BUCKETS } from "./lib/storage.ts";

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error(
      `ensure-local-buckets hanya boleh berjalan terhadap Supabase lokal. URL ditolak: ${url.hostname}`,
    );
  }
}

async function main() {
  const url = process.env.SUPABASE_URL ?? "http://127.0.0.1:54321";
  assertLocalSupabaseUrl(url);

  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY wajib diatur (kunci lokal Supabase).");
  }

  const client = createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const summary = await bootstrapMediaBuckets(client);
  console.log(
    `Bucket bootstrap lokal: created=${summary.created}, verified=${summary.verified}, mismatched=${summary.mismatched.length}`,
  );

  if (summary.mismatched.length > 0) {
    console.error("Konfigurasi bucket tidak sesuai spesifikasi:");
    for (const line of summary.mismatched) {
      console.error(` - ${line}`);
    }
    process.exitCode = 1;
    return;
  }

  // Final assertion: both required buckets must exist and be reachable
  // before any E2E test that uploads real files runs.
  for (const spec of MEDIA_BUCKETS) {
    const { data, error } = await client.storage.getBucket(spec.id);
    if (error || !data) {
      throw new Error(`Bucket "${spec.id}" tidak tersedia setelah bootstrap: ${error?.message ?? "tidak ditemukan"}`);
    }
  }
  console.log(`Terverifikasi: ${MEDIA_BUCKETS.map((b) => b.id).join(", ")} tersedia.`);
}

main().catch((error) => {
  console.error("ensure-local-buckets gagal:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
