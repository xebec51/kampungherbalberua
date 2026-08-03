// Local-only pipeline: install manually-curated, individually-verified plant
// photos (data/media/reports/verified-plant-photos-manifest.json) that were
// sourced and confirmed OUTSIDE the HerbaCode DOCX extraction pipeline --
// used for plants that have no DOCX candidate at all (e.g. delima) or whose
// DOCX candidate was rejected as ambiguous/unmatched (e.g. brahmi,
// temu-putih). Mirrors docx-photo-install.ts closely: local Supabase only,
// never overwrites an existing primary photo, never touches any plant not
// explicitly listed in the manifest.
//
// Usage:
//   node --experimental-strip-types scripts/media/verified-photo-install.ts audit
//   node --experimental-strip-types scripts/media/verified-photo-install.ts dry-run
//   node --experimental-strip-types scripts/media/verified-photo-install.ts apply
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/database.types.ts";
import { optimizeWebp, storageKey } from "../../src/lib/media/image-processing.ts";

const MANIFEST_PATH = resolve(
  process.cwd(),
  "data/media/reports/verified-plant-photos-manifest.json",
);
const AUDIT_PATH = resolve(
  process.cwd(),
  "data/media/reports/verified-photo-audit.json",
);
const DRY_RUN_PATH = resolve(
  process.cwd(),
  "data/media/reports/verified-photo-dry-run.json",
);
const APPLY_LOG_PATH = resolve(
  process.cwd(),
  "data/media/reports/verified-photo-apply-log.json",
);

type ManifestEntry = {
  plant_slug: string;
  plant_local_name: string;
  status: "confirmed" | "candidate" | "rejected";
  confidence: string;
  local_file: string;
  sha256: string;
  scientific_name: string;
  source_page_url: string;
  source_file_url: string;
  creator_name: string;
  license_code: string;
  license_url: string;
  attribution_text: string;
  photographed_at: string;
  verification_notes: string;
};

function writeJsonAtomic(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

function readManifest(): ManifestEntry[] {
  if (!existsSync(MANIFEST_PATH)) {
    throw new Error(`Manifest belum ada: ${MANIFEST_PATH}`);
  }
  const parsed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
    entries: ManifestEntry[];
  };
  if (!Array.isArray(parsed.entries)) {
    throw new Error("Manifest tidak valid: field entries bukan array.");
  }
  return parsed.entries;
}

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error(
      `verified-photo-install hanya boleh berjalan terhadap Supabase lokal. URL ditolak: ${url.hostname}`,
    );
  }

  return rawUrl;
}

function createLocalClient() {
  const url = assertLocalSupabaseUrl(process.env.SUPABASE_URL ?? "http://127.0.0.1:54321");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY wajib diatur (kunci lokal Supabase).");
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function loadPlantsBySlug(client: SupabaseClient<Database>, slugs: string[]) {
  const { data, error } = await client
    .from("plants")
    .select("id, slug, local_name, content_status, validation_status, scientific_name")
    .in("slug", slugs);
  if (error) {
    throw new Error(`Gagal memuat data tanaman: ${error.message}`);
  }
  return new Map((data ?? []).map((plant) => [plant.slug, plant]));
}

async function loadExistingPrimaryPlantMedia(
  client: SupabaseClient<Database>,
  plantIds: string[],
) {
  if (plantIds.length === 0) {
    return new Map<string, { media_id: string; plant_id: string }>();
  }
  const { data, error } = await client
    .from("plant_media")
    .select("plant_id, media_id, is_primary")
    .eq("is_primary", true)
    .in("plant_id", plantIds);
  if (error) {
    throw new Error(`Gagal memuat plant_media existing: ${error.message}`);
  }
  return new Map((data ?? []).map((row) => [row.plant_id, row]));
}

type PlanItem = {
  plant_slug: string;
  plant_local_name: string;
  plant_id: string | null;
  action: "install" | "skip";
  reason: string;
  local_file: string;
  source_hash: string;
  target_storage_path: string | null;
};

async function buildPlan(client: SupabaseClient<Database>) {
  const entries = readManifest().filter((entry) => entry.status === "confirmed");
  const plantsBySlug = await loadPlantsBySlug(
    client,
    entries.map((entry) => entry.plant_slug),
  );
  const primaryMedia = await loadExistingPrimaryPlantMedia(
    client,
    [...plantsBySlug.values()].map((plant) => plant.id),
  );

  const items: PlanItem[] = [];

  for (const entry of entries) {
    const plant = plantsBySlug.get(entry.plant_slug);
    const sourcePath = resolve(process.cwd(), entry.local_file);

    if (!plant) {
      items.push({
        plant_slug: entry.plant_slug,
        plant_local_name: entry.plant_local_name,
        plant_id: null,
        action: "skip",
        reason: "Tanaman tidak ditemukan di database (slug tidak cocok).",
        local_file: entry.local_file,
        source_hash: "",
        target_storage_path: null,
      });
      continue;
    }

    if (primaryMedia.has(plant.id)) {
      items.push({
        plant_slug: entry.plant_slug,
        plant_local_name: plant.local_name,
        plant_id: plant.id,
        action: "skip",
        reason: "Tanaman sudah memiliki foto utama (primary); foto existing dipertahankan, tidak ditimpa.",
        local_file: entry.local_file,
        source_hash: "",
        target_storage_path: null,
      });
      continue;
    }

    if (!existsSync(sourcePath)) {
      items.push({
        plant_slug: entry.plant_slug,
        plant_local_name: plant.local_name,
        plant_id: plant.id,
        action: "skip",
        reason: `File sumber tidak ditemukan: ${entry.local_file}`,
        local_file: entry.local_file,
        source_hash: "",
        target_storage_path: null,
      });
      continue;
    }

    const buffer = readFileSync(sourcePath);
    const hash = createHash("sha256").update(buffer).digest("hex");

    if (hash !== entry.sha256) {
      items.push({
        plant_slug: entry.plant_slug,
        plant_local_name: plant.local_name,
        plant_id: plant.id,
        action: "skip",
        reason: `Hash file sumber tidak cocok dengan manifest (file berubah sejak verifikasi) -- diharapkan ${entry.sha256}, dapat ${hash}.`,
        local_file: entry.local_file,
        source_hash: hash,
        target_storage_path: null,
      });
      continue;
    }

    const targetPath = storageKey({
      entityKey: plant.slug,
      hash,
      role: "cover",
      scope: "plants",
    });

    items.push({
      plant_slug: entry.plant_slug,
      plant_local_name: plant.local_name,
      plant_id: plant.id,
      action: "install",
      reason: "Tanaman belum memiliki foto utama; kandidat confirmed dari riset Wikimedia manual.",
      local_file: entry.local_file,
      source_hash: hash,
      target_storage_path: targetPath,
    });
  }

  return items;
}

async function runAudit() {
  const entries = readManifest();
  const plantsBySlug = await loadPlantsBySlug(
    createLocalClient(),
    entries.map((entry) => entry.plant_slug),
  );

  const report = {
    generatedAt: new Date().toISOString(),
    environment: "local",
    manifestEntries: entries.length,
    plants: entries.map((entry) => {
      const plant = plantsBySlug.get(entry.plant_slug);
      return {
        plant_slug: entry.plant_slug,
        found_in_db: Boolean(plant),
        content_status: plant?.content_status ?? null,
        validation_status: plant?.validation_status ?? null,
        db_scientific_name: plant?.scientific_name ?? null,
        manifest_scientific_name: entry.scientific_name,
        manifest_status: entry.status,
      };
    }),
  };

  writeJsonAtomic(AUDIT_PATH, report);
  console.log(
    `Audit lokal: ${report.plants.map((p) => `${p.plant_slug}=${p.found_in_db ? "ada" : "TIDAK ADA"}`).join(", ")}`,
  );
  return report;
}

async function runDryRun() {
  const client = createLocalClient();
  const items = await buildPlan(client);
  const installItems = items.filter((item) => item.action === "install");

  const problems: string[] = [];
  const pathCounts = new Map<string, string[]>();
  for (const item of installItems) {
    if (!item.target_storage_path) continue;
    const list = pathCounts.get(item.target_storage_path) ?? [];
    list.push(item.plant_slug);
    pathCounts.set(item.target_storage_path, list);
  }
  for (const [path, slugs] of pathCounts.entries()) {
    if (new Set(slugs).size > 1) {
      problems.push(`Dua tanaman berbeda memakai target path sama (${path}): ${slugs.join(", ")}`);
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    environment: "local",
    totalItems: items.length,
    willInstall: installItems.length,
    willSkip: items.length - installItems.length,
    noDeleteOperations: true,
    noOverwriteOperations: true,
    items,
    problems,
  };

  writeJsonAtomic(DRY_RUN_PATH, report);
  console.log(
    `Dry-run lokal: akan_install=${report.willInstall}, akan_skip=${report.willSkip}, masalah=${problems.length}`,
  );
  for (const item of items) {
    console.log(` - ${item.plant_slug}: ${item.action} (${item.reason})`);
  }

  if (problems.length > 0) {
    process.exitCode = 1;
  }

  return report;
}

type ApplyLog = {
  generatedAt: string;
  environment: "local";
  installed: number;
  skipped: number;
  failures: string[];
  installedPlants: string[];
};

async function runApply() {
  const dryRun = await runDryRun();
  if (process.exitCode === 1) {
    throw new Error("Dry-run lokal menemukan masalah; apply dibatalkan.");
  }

  const client = createLocalClient();
  const items = dryRun.items.filter(
    (item: PlanItem) => item.action === "install",
  ) as PlanItem[];

  const entriesBySlug = new Map(readManifest().map((entry) => [entry.plant_slug, entry]));

  const log: ApplyLog = {
    generatedAt: new Date().toISOString(),
    environment: "local",
    installed: 0,
    skipped: 0,
    failures: [],
    installedPlants: [],
  };

  for (const item of items) {
    const entry = entriesBySlug.get(item.plant_slug);
    if (!entry || !item.plant_id) {
      log.failures.push(`${item.plant_slug}: entry manifest atau plant_id hilang.`);
      continue;
    }

    // Re-check right before writing -- idempotent across repeated runs.
    const { data: existingPrimary } = await client
      .from("plant_media")
      .select("plant_id")
      .eq("plant_id", item.plant_id)
      .eq("is_primary", true)
      .maybeSingle();

    if (existingPrimary) {
      log.skipped += 1;
      continue;
    }

    const sourcePath = resolve(process.cwd(), entry.local_file);
    const rawBuffer = readFileSync(sourcePath);

    let original: Awaited<ReturnType<typeof optimizeWebp>>;
    let cover: Awaited<ReturnType<typeof optimizeWebp>>;
    try {
      [original, cover] = await Promise.all([
        optimizeWebp(rawBuffer, 2200, 2200),
        optimizeWebp(rawBuffer, 1200, 900),
      ]);
    } catch (error) {
      log.failures.push(
        `${item.plant_slug}: gagal memproses gambar (${error instanceof Error ? error.message : "unknown"})`,
      );
      continue;
    }

    const checksum = createHash("sha256").update(cover.data).digest("hex");
    const originalPath = storageKey({ entityKey: entry.plant_slug, hash: checksum, role: "original", scope: "plants" });
    const publicPath = storageKey({ entityKey: entry.plant_slug, hash: checksum, role: "cover", scope: "plants" });

    const { data: existingMedia } = await client
      .from("media_assets")
      .select("id")
      .eq("checksum_sha256", checksum)
      .maybeSingle();

    let mediaId = existingMedia?.id ?? null;

    if (!mediaId) {
      const originalUpload = await client.storage
        .from("media-originals")
        .upload(originalPath, original.data, {
          cacheControl: "31536000",
          contentType: "image/webp",
          upsert: false,
        });
      if (originalUpload.error && !/already exists/i.test(originalUpload.error.message)) {
        log.failures.push(`${item.plant_slug}: upload original gagal (${originalUpload.error.message})`);
        continue;
      }

      const publicUpload = await client.storage
        .from("media-public")
        .upload(publicPath, cover.data, {
          cacheControl: "31536000",
          contentType: "image/webp",
          upsert: false,
        });
      if (publicUpload.error && !/already exists/i.test(publicUpload.error.message)) {
        log.failures.push(`${item.plant_slug}: upload public gagal (${publicUpload.error.message})`);
        continue;
      }

      const { data: inserted, error: insertError } = await client
        .from("media_assets")
        .insert({
          alt_text: `Foto ${entry.plant_local_name} (${entry.scientific_name})`,
          asset_code: `media-${checksum.slice(0, 16)}`,
          attribution_text: entry.attribution_text,
          changes_made:
            "Diunduh dari Wikimedia Commons; dikonversi ke WebP dan disesuaikan ukurannya untuk web.",
          checksum_sha256: checksum,
          content_status: "published",
          creator_name: entry.creator_name,
          file_size_bytes: cover.data.length,
          height: cover.info.height,
          image_type: "cover",
          license_code: entry.license_code,
          license_url: entry.license_url,
          media_kind: "image",
          mime_type: "image/webp",
          original_bucket: "media-originals",
          original_path: originalPath,
          privacy_status: "not_required",
          public_bucket: "media-public",
          public_path: publicPath,
          rights_status: "approved",
          source_file_url: entry.source_file_url,
          source_page_url: entry.source_page_url,
          source_type: "wikimedia_commons",
          title: `Foto ${entry.plant_local_name}`,
          width: cover.info.width,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        log.failures.push(`${item.plant_slug}: media_assets gagal disimpan (${insertError?.message ?? "kosong"})`);
        continue;
      }

      mediaId = inserted.id;
    }

    const { error: linkError } = await client.from("plant_media").insert({
      is_primary: true,
      media_id: mediaId,
      plant_id: item.plant_id,
      role: "cover",
      sort_order: 0,
    });

    if (linkError) {
      log.failures.push(`${item.plant_slug}: gagal menautkan plant_media (${linkError.message})`);
      continue;
    }

    log.installed += 1;
    log.installedPlants.push(item.plant_slug);
  }

  writeJsonAtomic(APPLY_LOG_PATH, log);
  console.log(
    `Apply lokal: installed=${log.installed}, skip=${log.skipped}, gagal=${log.failures.length}`,
  );
  if (log.failures.length > 0) {
    console.error("Kegagalan:");
    for (const failure of log.failures) {
      console.error(` - ${failure}`);
    }
  }

  return log;
}

async function main() {
  const command = process.argv[2];

  if (command === "audit") {
    await runAudit();
    return;
  }
  if (command === "dry-run") {
    await runDryRun();
    return;
  }
  if (command === "apply") {
    await runApply();
    return;
  }

  throw new Error(`Command tidak dikenal: ${command}. Gunakan audit|dry-run|apply`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error tidak dikenal";
  console.error(`verified-photo-install gagal: ${message}`);
  process.exitCode = 1;
});
