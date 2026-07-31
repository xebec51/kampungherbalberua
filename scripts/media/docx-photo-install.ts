// Local-only pipeline: install DOCX-extracted plant photos that the
// matching pass (data/media/docx-image-match-report.json) confirmed,
// without ever touching an existing photo or remote Supabase.
//
// Usage:
//   node --experimental-strip-types scripts/media/docx-photo-install.ts audit
//   node --experimental-strip-types scripts/media/docx-photo-install.ts plan
//   node --experimental-strip-types scripts/media/docx-photo-install.ts dry-run
//   node --experimental-strip-types scripts/media/docx-photo-install.ts apply
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../src/lib/supabase/database.types.ts";
import { optimizeWebp, storageKey } from "../../src/lib/media/image-processing.ts";

const MATCH_REPORT_PATH = resolve(process.cwd(), "data/media/docx-image-match-report.json");
const AUDIT_PATH = resolve(process.cwd(), "data/media/reports/docx-photo-audit.json");
const PLAN_PATH = resolve(process.cwd(), "data/media/docx-image-upload-plan.json");
const APPLY_LOG_PATH = resolve(process.cwd(), "data/media/reports/docx-photo-apply-log.json");

type MatchStatus = "confirmed" | "probable" | "ambiguous" | "unmatched" | "ignored";

type MatchRecord = {
  image_number: number;
  image_file: string;
  plant_local_name?: string | null;
  plant_slug?: string | null;
  plant_id?: string | null;
  health_zone?: string | null;
  status: MatchStatus;
  duplicate_of?: number | null;
  [key: string]: unknown;
};

type MatchReport = {
  matches: MatchRecord[];
  [key: string]: unknown;
};

type PlanItem = {
  source_file: string;
  source_hash: string;
  plant_id: string;
  plant_slug: string;
  plant_local_name: string;
  target_storage_path: string;
  action: "install" | "skip";
  reason: string;
  replace_existing: boolean;
  confidence: string;
  status: MatchStatus;
};

function assertLocalSupabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const allowedHosts = new Set(["localhost", "127.0.0.1"]);

  if (url.hostname.endsWith("supabase.co") || !allowedHosts.has(url.hostname)) {
    throw new Error(
      `Pipeline foto DOCX hanya boleh berjalan terhadap Supabase lokal. URL ditolak: ${url.hostname}`,
    );
  }

  return url.toString().replace(/\/$/, "");
}

function getLocalAdminClient(): SupabaseClient<Database> {
  const url = assertLocalSupabaseUrl(
    process.env.SUPABASE_URL ?? "http://127.0.0.1:54321",
  );
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!key) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY wajib diatur (kunci lokal Supabase).");
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function writeJsonAtomic(path: string, data: unknown) {
  mkdirSync(dirname(path), { recursive: true });
  const tmp = `${path}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(data, null, 2)}\n`, "utf8");
  renameSync(tmp, path);
}

function readMatchReport(): MatchReport {
  if (!existsSync(MATCH_REPORT_PATH)) {
    throw new Error(`Match report belum ada: ${MATCH_REPORT_PATH}`);
  }

  const parsed = JSON.parse(readFileSync(MATCH_REPORT_PATH, "utf8")) as MatchReport;

  if (!Array.isArray(parsed.matches)) {
    throw new Error("Match report tidak valid: field matches bukan array.");
  }

  return parsed;
}

// One confirmed candidate per plant: lowest image_number among confirmed,
// non-duplicate entries for that plant_slug. Also detects the same source
// image confidently matched to more than one plant (a data-quality conflict
// -- excluded from install rather than guessed at).
function resolvePrimaryCandidates(matches: MatchRecord[]) {
  const confirmed = matches.filter(
    (entry) => entry.status === "confirmed" && !entry.duplicate_of && entry.plant_slug,
  );

  const byPlant = new Map<string, MatchRecord[]>();
  for (const entry of confirmed) {
    const slug = entry.plant_slug as string;
    const list = byPlant.get(slug) ?? [];
    list.push(entry);
    byPlant.set(slug, list);
  }

  const byImageFile = new Map<string, Set<string>>();
  for (const entry of confirmed) {
    const set = byImageFile.get(entry.image_file) ?? new Set<string>();
    set.add(entry.plant_slug as string);
    byImageFile.set(entry.image_file, set);
  }

  const conflictedImageFiles = new Set(
    Array.from(byImageFile.entries())
      .filter(([, plants]) => plants.size > 1)
      .map(([file]) => file),
  );

  const primaryByPlant = new Map<string, MatchRecord>();
  const skippedExtraCandidates: MatchRecord[] = [];
  const conflicts: MatchRecord[] = [];

  for (const [slug, entries] of byPlant.entries()) {
    const clean = entries.filter((entry) => !conflictedImageFiles.has(entry.image_file));
    const conflicted = entries.filter((entry) => conflictedImageFiles.has(entry.image_file));
    conflicts.push(...conflicted);

    if (clean.length === 0) {
      continue;
    }

    const sorted = [...clean].sort((a, b) => a.image_number - b.image_number);
    primaryByPlant.set(slug, sorted[0]);
    skippedExtraCandidates.push(...sorted.slice(1));
  }

  return { primaryByPlant, skippedExtraCandidates, conflicts };
}

async function loadLocalPlants(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("plants")
    .select("id, slug, local_name, content_status, image_path");

  if (error || !data) {
    throw new Error(`Gagal memuat data tanaman lokal: ${error?.message ?? "kosong"}`);
  }

  return data;
}

async function loadExistingPrimaryPlantMedia(client: SupabaseClient<Database>) {
  const { data, error } = await client
    .from("plant_media")
    .select("plant_id, media_id, is_primary")
    .eq("is_primary", true);

  if (error) {
    throw new Error(`Gagal memuat plant_media existing: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.plant_id, row]));
}

function isPlaceholderPath(value: string | null) {
  return !value || value.startsWith("/images/placeholders/");
}

async function runAudit() {
  const client = getLocalAdminClient();
  const report = readMatchReport();
  const { primaryByPlant, skippedExtraCandidates, conflicts } = resolvePrimaryCandidates(
    report.matches,
  );
  const plants = await loadLocalPlants(client);
  const primaryMedia = await loadExistingPrimaryPlantMedia(client);

  const withoutExistingPhoto: string[] = [];
  const withExistingValidPhoto: string[] = [];
  const withMediaButNoPrimary: string[] = [];
  const withBrokenPath: string[] = [];

  for (const plant of plants) {
    const hasPrimaryMedia = primaryMedia.has(plant.id);
    const hasUsableImagePath = !isPlaceholderPath(plant.image_path);

    if (hasPrimaryMedia || hasUsableImagePath) {
      withExistingValidPhoto.push(plant.slug);
      continue;
    }

    if (plant.image_path && isPlaceholderPath(plant.image_path)) {
      withBrokenPath.push(plant.slug);
    }

    withoutExistingPhoto.push(plant.slug);
  }

  const plantsWithMultipleCandidates = Array.from(
    new Set(skippedExtraCandidates.map((entry) => entry.plant_slug)),
  );

  const auditReport = {
    generatedAt: new Date().toISOString(),
    totalLocalPlants: plants.length,
    withoutExistingPhoto,
    withExistingValidPhoto,
    withMediaButNoPrimary,
    withBrokenPath,
    sameDocxImageMatchedToMultiplePlants: Array.from(
      new Set(conflicts.map((entry) => entry.image_file)),
    ),
    plantsWithMultipleConfirmedCandidates: plantsWithMultipleCandidates,
    confirmedPrimaryCandidateCount: primaryByPlant.size,
    plantsEligibleForInstall: Array.from(primaryByPlant.keys()).filter((slug) =>
      withoutExistingPhoto.includes(slug),
    ),
  };

  writeJsonAtomic(AUDIT_PATH, auditReport);
  console.log(
    `Audit: total_tanaman=${plants.length}, tanpa_foto=${withoutExistingPhoto.length}, sudah_ada_foto=${withExistingValidPhoto.length}, kandidat_confirmed=${primaryByPlant.size}, layak_install=${auditReport.plantsEligibleForInstall.length}, konflik_gambar=${auditReport.sameDocxImageMatchedToMultiplePlants.length}`,
  );

  return auditReport;
}

async function runPlan() {
  const client = getLocalAdminClient();
  const report = readMatchReport();
  const { primaryByPlant } = resolvePrimaryCandidates(report.matches);
  const plants = await loadLocalPlants(client);
  const plantBySlug = new Map(plants.map((plant) => [plant.slug, plant]));
  const primaryMedia = await loadExistingPrimaryPlantMedia(client);

  const items: PlanItem[] = [];

  for (const [slug, entry] of primaryByPlant.entries()) {
    const plant = plantBySlug.get(slug);
    const sourcePath = resolve(process.cwd(), entry.image_file);

    if (!plant) {
      items.push({
        source_file: entry.image_file,
        source_hash: "",
        plant_id: "",
        plant_slug: slug,
        plant_local_name: entry.plant_local_name ?? "",
        target_storage_path: "",
        action: "skip",
        reason: "Tanaman tidak ditemukan di database lokal untuk slug ini.",
        replace_existing: false,
        confidence: String(entry.confidence ?? ""),
        status: entry.status,
      });
      continue;
    }

    const hasExistingPhoto =
      primaryMedia.has(plant.id) || !isPlaceholderPath(plant.image_path);

    if (hasExistingPhoto) {
      items.push({
        source_file: entry.image_file,
        source_hash: "",
        plant_id: plant.id,
        plant_slug: slug,
        plant_local_name: plant.local_name,
        target_storage_path: "",
        action: "skip",
        reason: "Tanaman sudah memiliki foto yang valid; foto existing dipertahankan.",
        replace_existing: false,
        confidence: String(entry.confidence ?? ""),
        status: entry.status,
      });
      continue;
    }

    if (!existsSync(sourcePath)) {
      items.push({
        source_file: entry.image_file,
        source_hash: "",
        plant_id: plant.id,
        plant_slug: slug,
        plant_local_name: plant.local_name,
        target_storage_path: "",
        action: "skip",
        reason: `File sumber tidak ditemukan: ${entry.image_file}`,
        replace_existing: false,
        confidence: String(entry.confidence ?? ""),
        status: entry.status,
      });
      continue;
    }

    const buffer = readFileSync(sourcePath);
    const hash = createHash("sha256").update(buffer).digest("hex");
    const targetPath = storageKey({
      entityKey: plant.slug,
      hash,
      role: "cover",
      scope: "plants",
    });

    items.push({
      source_file: entry.image_file,
      source_hash: hash,
      plant_id: plant.id,
      plant_slug: slug,
      plant_local_name: plant.local_name,
      target_storage_path: targetPath,
      action: "install",
      reason: "Tanaman belum memiliki foto; kandidat confirmed dari DOCX HerbaCode.",
      replace_existing: false,
      confidence: String(entry.confidence ?? ""),
      status: entry.status,
    });
  }

  writeJsonAtomic(PLAN_PATH, {
    generatedAt: new Date().toISOString(),
    totalItems: items.length,
    installCount: items.filter((item) => item.action === "install").length,
    skipCount: items.filter((item) => item.action === "skip").length,
    items,
  });

  console.log(
    `Plan: total=${items.length}, install=${items.filter((i) => i.action === "install").length}, skip=${items.filter((i) => i.action === "skip").length}`,
  );

  return items;
}

function loadPlan(): PlanItem[] {
  if (!existsSync(PLAN_PATH)) {
    throw new Error(`Upload plan belum ada, jalankan "plan" dulu: ${PLAN_PATH}`);
  }

  const parsed = JSON.parse(readFileSync(PLAN_PATH, "utf8")) as { items: PlanItem[] };
  return parsed.items;
}

function runDryRun() {
  const items = loadPlan();
  const installItems = items.filter((item) => item.action === "install");
  const problems: string[] = [];

  for (const item of installItems) {
    if (!item.plant_id || !item.plant_slug) {
      problems.push(`Item tanpa plant_id/slug valid: ${item.source_file}`);
    }

    if (item.replace_existing) {
      problems.push(`Item mencoba replace_existing tanpa aturan eksplisit: ${item.plant_slug}`);
    }

    if (!existsSync(resolve(process.cwd(), item.source_file))) {
      problems.push(`File sumber hilang: ${item.source_file}`);
    }
  }

  const pathCounts = new Map<string, string[]>();
  for (const item of installItems) {
    const list = pathCounts.get(item.target_storage_path) ?? [];
    list.push(item.plant_slug);
    pathCounts.set(item.target_storage_path, list);
  }

  for (const [path, slugs] of pathCounts.entries()) {
    if (new Set(slugs).size > 1) {
      problems.push(`Dua tanaman berbeda memakai target path sama (${path}): ${slugs.join(", ")}`);
    }
  }

  // Local-only guard: this throws already if SUPABASE_URL isn't local, but
  // dry-run should never even construct a client, so assert directly here.
  assertLocalSupabaseUrl(process.env.SUPABASE_URL ?? "http://127.0.0.1:54321");

  const report = {
    generatedAt: new Date().toISOString(),
    totalPlanItems: items.length,
    willInstall: installItems.length,
    willSkip: items.length - installItems.length,
    targetPaths: installItems.map((item) => item.target_storage_path),
    noDeleteOperations: true,
    noRemoteAccess: true,
    problems,
  };

  console.log(
    `Dry-run: akan_install=${report.willInstall}, akan_skip=${report.willSkip}, masalah=${problems.length}`,
  );

  if (problems.length > 0) {
    console.error("Dry-run menemukan masalah, hentikan sebelum apply:");
    for (const problem of problems) {
      console.error(` - ${problem}`);
    }
    process.exitCode = 1;
  }

  return report;
}

async function runApply() {
  runDryRun();

  if (process.exitCode === 1) {
    throw new Error("Dry-run gagal; apply dibatalkan.");
  }

  const client = getLocalAdminClient();
  const items = loadPlan().filter((item) => item.action === "install");
  const primaryMedia = await loadExistingPrimaryPlantMedia(client);

  const log = {
    generatedAt: new Date().toISOString(),
    installed: 0,
    skippedAlreadyHasPrimary: 0,
    reusedExistingMediaAsset: 0,
    failures: [] as string[],
  };

  for (const item of items) {
    // Re-check right before writing (idempotent across repeated runs, and
    // safe if something else linked a primary between plan and apply).
    if (primaryMedia.has(item.plant_id)) {
      log.skippedAlreadyHasPrimary += 1;
      continue;
    }

    const sourcePath = resolve(process.cwd(), item.source_file);
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
    const originalPath = storageKey({
      entityKey: item.plant_slug,
      hash: checksum,
      role: "original",
      scope: "plants",
    });
    const publicPath = storageKey({
      entityKey: item.plant_slug,
      hash: checksum,
      role: "cover",
      scope: "plants",
    });

    const { data: existingMedia } = await client
      .from("media_assets")
      .select("id")
      .eq("checksum_sha256", checksum)
      .maybeSingle();

    let mediaId = existingMedia?.id ?? null;

    if (mediaId) {
      log.reusedExistingMediaAsset += 1;
    } else {
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
          alt_text: `Foto ${item.plant_local_name}`,
          asset_code: `media-docx-${checksum.slice(0, 16)}`,
          changes_made:
            "Diekstrak dari dokumen HerbaCode (herba code.docx); dikonversi ke WebP dan disesuaikan ukurannya untuk web.",
          checksum_sha256: checksum,
          content_status: "published",
          file_size_bytes: cover.data.length,
          height: cover.info.height,
          image_type: "cover",
          media_kind: "image",
          mime_type: "image/webp",
          original_bucket: "media-originals",
          original_path: originalPath,
          privacy_status: "not_required",
          public_bucket: "media-public",
          public_path: publicPath,
          rights_status: "approved",
          source_type: "kkn_documentation",
          title: `Foto ${item.plant_local_name}`,
          width: cover.info.width,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        log.failures.push(
          `${item.plant_slug}: media_assets gagal disimpan (${insertError?.message ?? "kosong"})`,
        );
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

    primaryMedia.set(item.plant_id, { is_primary: true, media_id: mediaId, plant_id: item.plant_id });
    log.installed += 1;
  }

  writeJsonAtomic(APPLY_LOG_PATH, log);
  console.log(
    `Apply: installed=${log.installed}, skip_sudah_primary=${log.skippedAlreadyHasPrimary}, reuse_media=${log.reusedExistingMediaAsset}, gagal=${log.failures.length}`,
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

  if (command === "plan") {
    await runPlan();
    return;
  }

  if (command === "dry-run") {
    runDryRun();
    return;
  }

  if (command === "apply") {
    await runApply();
    return;
  }

  throw new Error(`Command tidak dikenal: ${command}. Gunakan audit|plan|dry-run|apply`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Error tidak dikenal";
  console.error(`docx-photo-install gagal: ${message}`);
  process.exitCode = 1;
});
