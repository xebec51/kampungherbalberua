import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import { POSTER_SOURCE_CODE } from "./poster.ts";

type MediaRow = Database["public"]["Tables"]["media_assets"]["Row"];

type LabelMediaRow = {
  media_id: string;
  normalized_name: string;
  raw_name: string;
  slug: string;
  media_assets: MediaRow | null;
};

type PlantMediaRow = {
  media_id: string;
  plant_id: string;
  plants: { canonical_local_name: string | null; local_name: string; slug: string } | null;
  media_assets: MediaRow | null;
};

type EntryRow = {
  normalized_candidate_name: string | null;
  raw_plant_name: string;
};

export type CatalogImageAuditSummary = {
  catalogItems: number;
  posterEntries: number;
  uniquePosterNames: number;
  catalogItemsWithImage: number;
  specificImages: number;
  illustrationImages: number;
  genericFallbackImages: number;
  reusedMediaCount: number;
  duplicateChecksumGroups: Array<{ checksum: string; count: number; names: string[] }>;
  lowResolutionMedia: Array<{ mediaId: string; title: string; width: number | null; height: number | null }>;
  incompleteAttribution: string[];
  missingSourcePage: string[];
  missingLicense: string[];
  brokenPublicUrls: string[];
  researchTargets: Array<{ normalizedName: string; rawName: string; slug: string; reason: string }>;
};

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function normalizeName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isGenericPosterMedia(media: MediaRow | null) {
  if (!media) return true;
  return media.title === "Ilustrasi referensi tanaman herbal poster";
}

function hasCompleteAttribution(media: MediaRow) {
  return Boolean(media.attribution_text || media.creator_name);
}

function hasLowResolution(media: MediaRow) {
  return Math.max(media.width ?? 0, media.height ?? 0) < 1200;
}

function getSupabasePublicUrl() {
  return (
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    ""
  ).replace(/\/$/, "");
}

async function readPosterSourceId(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("plant_sources")
    .select("id")
    .eq("source_code", POSTER_SOURCE_CODE)
    .single();

  if (error || !data) {
    throw new Error(`Sumber poster tidak ditemukan: ${error?.message ?? "kosong"}`);
  }

  return data.id;
}

export async function auditCatalogImages(
  supabase: SupabaseClient<Database>,
  options: { checkUrls?: boolean } = {},
) {
  const sourceId = await readPosterSourceId(supabase);
  const { data: entries, error: entryError } = await supabase
    .from("plant_source_entries")
    .select("raw_plant_name, normalized_candidate_name")
    .eq("source_id", sourceId);

  if (entryError) {
    throw new Error(`Gagal membaca entri poster: ${entryError.message}`);
  }

  const uniqueNames = new Map<string, string>();

  for (const entry of (entries ?? []) as EntryRow[]) {
    const normalized =
      entry.normalized_candidate_name ?? normalizeName(entry.raw_plant_name);
    uniqueNames.set(normalized, entry.raw_plant_name);
  }

  const { data: labelRows, error: labelError } = await supabase
    .from("plant_source_label_media")
    .select("normalized_name, raw_name, slug, media_id, media_assets(*)")
    .eq("source_id", sourceId)
    .eq("is_primary", true);

  if (labelError) {
    throw new Error(`Gagal membaca media poster: ${labelError.message}`);
  }

  const { data: plantRows, error: plantError } = await supabase
    .from("plant_media")
    .select("plant_id, media_id, plants(local_name, canonical_local_name, slug), media_assets(*)")
    .eq("is_primary", true);

  if (plantError) {
    throw new Error(`Gagal membaca media tanaman: ${plantError.message}`);
  }

  const labels = (labelRows ?? []) as LabelMediaRow[];
  const plantMedia = (plantRows ?? []) as PlantMediaRow[];
  const mediaUsage = new Map<string, { media: MediaRow; names: string[] }>();
  const checksumUsage = new Map<string, { checksum: string; names: string[] }>();
  const incompleteAttribution: string[] = [];
  const missingSourcePage: string[] = [];
  const missingLicense: string[] = [];
  const lowResolutionMedia: CatalogImageAuditSummary["lowResolutionMedia"] = [];
  const researchTargets: CatalogImageAuditSummary["researchTargets"] = [];
  const brokenPublicUrls: string[] = [];
  let specificImages = 0;
  let genericFallbackImages = 0;

  for (const label of labels) {
    const media = label.media_assets;
    const name = label.raw_name;

    if (!media) {
      researchTargets.push({
        normalizedName: label.normalized_name,
        rawName: label.raw_name,
        reason: "attachment tanpa media asset",
        slug: label.slug,
      });
      continue;
    }

    if (isGenericPosterMedia(media)) {
      genericFallbackImages += 1;
      researchTargets.push({
        normalizedName: label.normalized_name,
        rawName: label.raw_name,
        reason: "generic_fallback",
        slug: label.slug,
      });
    } else {
      specificImages += 1;
    }

    if (!hasCompleteAttribution(media)) incompleteAttribution.push(name);
    if (!media.source_page_url) missingSourcePage.push(name);
    if (!media.license_code) missingLicense.push(name);
    if (hasLowResolution(media)) {
      lowResolutionMedia.push({
        height: media.height,
        mediaId: media.id,
        title: media.title,
        width: media.width,
      });
    }

    const usage = mediaUsage.get(media.id) ?? { media, names: [] };
    usage.names.push(name);
    mediaUsage.set(media.id, usage);

    const checksum = checksumUsage.get(media.checksum_sha256) ?? {
      checksum: media.checksum_sha256,
      names: [],
    };
    checksum.names.push(name);
    checksumUsage.set(media.checksum_sha256, checksum);

    if (options.checkUrls && media.public_bucket && media.public_path) {
      const baseUrl = getSupabasePublicUrl();
      if (!baseUrl) continue;
      const publicUrl = `${baseUrl}/storage/v1/object/public/${media.public_bucket}/${media.public_path}`;
      try {
        const response = await fetch(publicUrl, { method: "HEAD" });
        if (!response.ok) brokenPublicUrls.push(`${name}: HTTP ${response.status}`);
      } catch {
        brokenPublicUrls.push(`${name}: tidak dapat diakses`);
      }
    }
  }

  for (const row of plantMedia) {
    const media = row.media_assets;
    const name = row.plants?.canonical_local_name ?? row.plants?.local_name ?? row.plant_id;

    if (!media) continue;
    const usage = mediaUsage.get(media.id) ?? { media, names: [] };
    usage.names.push(name);
    mediaUsage.set(media.id, usage);
  }

  const duplicateChecksumGroups = Array.from(checksumUsage.values())
    .filter((group) => group.names.length > 1)
    .map((group) => ({
      checksum: group.checksum,
      count: group.names.length,
      names: group.names.sort((a, b) => a.localeCompare(b, "id")),
    }));
  const duplicateMedia = Array.from(mediaUsage.values()).filter(
    (usage) => usage.names.length > 1,
  );
  const summary: CatalogImageAuditSummary = {
    brokenPublicUrls,
    catalogItems: uniqueNames.size,
    catalogItemsWithImage: labels.length + Math.max(0, uniqueNames.size - labels.length),
    duplicateChecksumGroups,
    genericFallbackImages,
    illustrationImages: labels.filter((label) => label.media_assets?.image_type === "illustration").length,
    incompleteAttribution,
    lowResolutionMedia,
    missingLicense,
    missingSourcePage,
    posterEntries: entries?.length ?? 0,
    researchTargets,
    reusedMediaCount: duplicateMedia.length,
    specificImages,
    uniquePosterNames: uniqueNames.size,
  };

  const duplicates = {
    checksumGroups: duplicateChecksumGroups,
    excessiveReuseGroups: duplicateMedia
      .filter((usage) => usage.names.length > 3)
      .map((usage) => ({
        count: usage.names.length,
        mediaId: usage.media.id,
        names: usage.names.sort((a, b) => a.localeCompare(b, "id")),
        title: usage.media.title,
      })),
    mediaGroups: duplicateMedia.map((usage) => ({
      count: usage.names.length,
      mediaId: usage.media.id,
      names: usage.names.sort((a, b) => a.localeCompare(b, "id")),
      title: usage.media.title,
    })),
  };

  writeJson("data/media/reports/catalog-image-audit-before.json", summary);
  writeJson("data/media/reports/catalog-image-duplicates.json", duplicates);
  return summary;
}
