import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import {
  downloadImage,
  optimizeWebp,
  sha256,
  storageKey,
  uploadNoOverwrite,
} from "./media-files.ts";
import { normalizePlantName, POSTER_SOURCE_CODE } from "./poster.ts";
import { searchWikimediaImages, type WikimediaCandidate } from "./wikimedia.ts";

type PosterPlantImageSummary = {
  uniquePosterNames: number;
  catalogItems: number;
  catalogItemsWithImage: number;
  linkedPlants: number;
  posterOnlyItems: number;
  reusedPlantMedia: number;
  searchedNames: number;
  wikimediaRequests: number;
  exactImages: number;
  illustrationImages: number;
  approvedImages: number;
  genericFallbackImages: number;
  duplicateMediaReused: number;
  uploadedOriginals: number;
  uploadedDerivatives: number;
  attachmentCount: number;
  storageBytes: number;
  failures: string[];
  retries: number;
};

type PosterPlantImageReportItem = {
  rawName: string;
  normalizedName: string;
  slug: string;
  linkedPlantId: string | null;
  imageSource: "plant_media" | "generic_wikimedia";
  imageIsIllustration: boolean;
  mediaId: string | null;
  sourcePageUrl: string | null;
  licenseCode: string | null;
};

type MediaDetails = {
  fileSizeBytes: number;
  licenseCode: string | null;
  sourcePageUrl: string | null;
};

type PosterGroup = {
  rawName: string;
  normalizedName: string;
  slug: string;
  linkedPlantId: string | null;
};

const GENERIC_WIKIMEDIA_QUERY = "herbal plants";

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function slugify(value: string) {
  return normalizePlantName(value).replace(/\s+/g, "-") || "tanaman-poster";
}

function makeStableSlug(rawName: string, usedSlugs: Set<string>) {
  const baseSlug = slugify(rawName);
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

async function readPosterSource(supabase: SupabaseClient<Database>) {
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

async function readPosterGroups(supabase: SupabaseClient<Database>) {
  const sourceId = await readPosterSource(supabase);
  const { data, error } = await supabase
    .from("plant_source_entries")
    .select("raw_plant_name, normalized_candidate_name, plant_id")
    .eq("source_id", sourceId)
    .order("poster_number", { ascending: true });

  if (error) {
    throw new Error(`Gagal membaca entri poster: ${error.message}`);
  }

  const usedSlugs = new Set<string>();
  const groups = new Map<string, PosterGroup>();

  for (const entry of data ?? []) {
    const normalizedName =
      entry.normalized_candidate_name ?? normalizePlantName(entry.raw_plant_name);
    const existing = groups.get(normalizedName);

    if (existing) {
      existing.linkedPlantId = existing.linkedPlantId ?? entry.plant_id;
      continue;
    }

    groups.set(normalizedName, {
      linkedPlantId: entry.plant_id,
      normalizedName,
      rawName: entry.raw_plant_name,
      slug: makeStableSlug(entry.raw_plant_name, usedSlugs),
    });
  }

  return {
    groups: Array.from(groups.values()).sort((a, b) =>
      a.rawName.localeCompare(b.rawName, "id"),
    ),
    sourceId,
  };
}

async function readPlantMediaIds(
  supabase: SupabaseClient<Database>,
  plantIds: string[],
) {
  if (plantIds.length === 0) {
    return new Map<string, string>();
  }

  const { data, error } = await supabase
    .from("plant_media")
    .select("plant_id, media_id")
    .in("plant_id", plantIds)
    .eq("is_primary", true);

  if (error) {
    throw new Error(`Gagal membaca plant_media: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.plant_id, row.media_id]));
}

async function readLabelMediaIds(
  supabase: SupabaseClient<Database>,
  sourceId: string,
) {
  const { data, error } = await supabase
    .from("plant_source_label_media")
    .select("normalized_name, media_id")
    .eq("source_id", sourceId)
    .eq("is_primary", true);

  if (error) {
    throw new Error(`Gagal membaca media label poster: ${error.message}`);
  }

  return new Map((data ?? []).map((row) => [row.normalized_name, row.media_id]));
}

async function readMediaDetails(
  supabase: SupabaseClient<Database>,
  mediaIds: string[],
) {
  if (mediaIds.length === 0) {
    return new Map<string, MediaDetails>();
  }

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, file_size_bytes, license_code, source_page_url")
    .in("id", mediaIds);

  if (error) {
    throw new Error(`Gagal membaca detail media: ${error.message}`);
  }

  return new Map(
    (data ?? []).map((row) => [
      row.id,
      {
        fileSizeBytes: Number(row.file_size_bytes ?? 0),
        licenseCode: row.license_code,
        sourcePageUrl: row.source_page_url,
      },
    ]),
  );
}

function chooseGenericCandidate(candidates: WikimediaCandidate[]) {
  return candidates.find(
    (candidate) =>
      candidate.licenseStatus === "approved" &&
      Boolean(candidate.sourcePageUrl) &&
      Boolean(candidate.sourceFileUrl) &&
      Boolean(candidate.licenseCode) &&
      Boolean(candidate.licenseUrl) &&
      Boolean(candidate.creatorName || candidate.attributionText) &&
      Math.max(candidate.width, candidate.height) >= 1200,
  );
}

async function createOrReuseGenericMedia(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean },
) {
  const candidates = await searchWikimediaImages(GENERIC_WIKIMEDIA_QUERY, 10);
  const candidate = chooseGenericCandidate(candidates);

  if (!candidate) {
    throw new Error("Tidak ada gambar herbal generik Wikimedia yang lolos lisensi.");
  }

  const downloaded = await downloadImage(candidate.sourceFileUrl);
  const original = await optimizeWebp(downloaded.buffer, 2200, 2200);
  const publicVariant = await optimizeWebp(downloaded.buffer, 1200, 900);
  const checksum = sha256(publicVariant.data);
  const originalPath = storageKey({
    entityKey: "poster-generic-herbal",
    hash: checksum,
    role: "original",
    scope: "plants",
  });
  const publicPath = storageKey({
    entityKey: "poster-generic-herbal",
    hash: checksum,
    role: "cover",
    scope: "plants",
  });

  if (options.dryRun) {
    return {
      candidate,
      checksum,
      duplicateMediaReused: 0,
      mediaId: null,
      originalUploaded: 0,
      publicUploaded: 0,
      publicSize: publicVariant.data.length,
      retries: downloaded.retries,
    };
  }

  const originalUpload = await uploadNoOverwrite(
    supabase,
    "media-originals",
    originalPath,
    original.data,
  );
  const publicUpload = await uploadNoOverwrite(
    supabase,
    "media-public",
    publicPath,
    publicVariant.data,
  );
  const { data: existing, error: existingError } = await supabase
    .from("media_assets")
    .select("id")
    .eq("checksum_sha256", checksum)
    .maybeSingle();

  if (existingError) {
    throw new Error(`Gagal mencari media checksum: ${existingError.message}`);
  }

  let mediaId = existing?.id ?? null;

  if (!mediaId) {
    const { data: inserted, error: insertError } = await supabase
      .from("media_assets")
      .insert({
        alt_text: "Ilustrasi referensi tanaman herbal dari sumber berlisensi",
        asset_code: `media-${checksum.slice(0, 16)}`,
        attribution_text: candidate.attributionText,
        caption: "Ilustrasi referensi untuk nama tanaman pada poster.",
        changes_made:
          "Metadata EXIF/GPS dihapus; dikonversi ke WebP; ukuran disesuaikan untuk web.",
        checksum_sha256: checksum,
        content_status: "published",
        creator_name: candidate.creatorName,
        file_size_bytes: publicVariant.data.length,
        height: publicVariant.info.height,
        image_type: "illustration",
        license_code: candidate.licenseCode,
        license_url: candidate.licenseUrl,
        media_kind: "image",
        mime_type: "image/webp",
        original_bucket: "media-originals",
        original_path: originalPath,
        privacy_status: "not_required",
        public_bucket: "media-public",
        public_path: publicPath,
        rights_status: "approved",
        source_file_url: candidate.sourceFileUrl,
        source_page_url: candidate.sourcePageUrl,
        source_type: "wikimedia_commons",
        title: "Ilustrasi referensi tanaman herbal poster",
        width: publicVariant.info.width,
      })
      .select("id")
      .single();

    if (insertError || !inserted) {
      throw new Error(`Gagal membuat media generik: ${insertError?.message ?? "kosong"}`);
    }

    mediaId = inserted.id;
  }

  return {
    candidate,
    checksum,
    duplicateMediaReused:
      existing || originalUpload === "reused" || publicUpload === "reused" ? 1 : 0,
    mediaId,
    originalUploaded: originalUpload === "uploaded" ? 1 : 0,
    publicUploaded: publicUpload === "uploaded" ? 1 : 0,
    publicSize: publicVariant.data.length,
    retries: downloaded.retries,
  };
}

export async function researchPosterPlantImages(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean; limit?: number; offset?: number; only?: string },
) {
  const { groups, sourceId } = await readPosterGroups(supabase);
  const selectedGroups = groups
    .filter((group) => !options.only || group.slug === options.only)
    .slice(options.offset ?? 0, options.limit ? (options.offset ?? 0) + options.limit : undefined);
  const plantIds = Array.from(
    new Set(
      groups
        .map((group) => group.linkedPlantId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const plantMediaById = await readPlantMediaIds(supabase, plantIds);
  const labelMediaByName = await readLabelMediaIds(supabase, sourceId);
  const missingGroups = groups.filter((group) => {
    const plantMedia = group.linkedPlantId
      ? plantMediaById.get(group.linkedPlantId)
      : null;
    return !plantMedia && !labelMediaByName.get(group.normalizedName);
  });
  const generic = missingGroups.length
    ? await createOrReuseGenericMedia(supabase, { dryRun: options.dryRun })
    : null;
  const failures: string[] = [];

  for (const group of selectedGroups) {
    const plantMedia = group.linkedPlantId
      ? plantMediaById.get(group.linkedPlantId) ?? null
      : null;
    const existingLabelMedia = labelMediaByName.get(group.normalizedName) ?? null;
    const mediaId = plantMedia ?? existingLabelMedia ?? generic?.mediaId ?? null;

    if (!mediaId && !options.dryRun) {
      failures.push(`${group.rawName}: media kosong`);
      continue;
    }

    if (!plantMedia && !existingLabelMedia && generic?.mediaId && !options.dryRun) {
      const { error } = await supabase.from("plant_source_label_media").upsert(
        {
          is_primary: true,
          label_as_illustration: true,
          media_id: generic.mediaId,
          normalized_name: group.normalizedName,
          raw_name: group.rawName,
          role: "cover",
          slug: group.slug,
          source_id: sourceId,
        },
        { onConflict: "source_id,slug" },
      );

      if (error) {
        failures.push(`${group.rawName}: ${error.message}`);
        continue;
      }

      labelMediaByName.set(group.normalizedName, generic.mediaId);
    }
  }

  const finalPlantMediaCount = groups.filter(
    (group) => group.linkedPlantId && plantMediaById.get(group.linkedPlantId),
  ).length;
  const finalLabelMediaCount = options.dryRun
    ? labelMediaByName.size + missingGroups.length
    : labelMediaByName.size;
  const finalMediaIds = Array.from(
    new Set(
      groups
        .map((group) => {
          const plantMedia = group.linkedPlantId
            ? plantMediaById.get(group.linkedPlantId) ?? null
            : null;
          return plantMedia ?? labelMediaByName.get(group.normalizedName) ?? null;
        })
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const mediaDetails = await readMediaDetails(supabase, finalMediaIds);
  const finalLabelMediaIds = Array.from(new Set(labelMediaByName.values()));
  const labelStorageBytes = finalLabelMediaIds.reduce(
    (total, mediaId) => total + (mediaDetails.get(mediaId)?.fileSizeBytes ?? 0),
    0,
  );
  const report: PosterPlantImageReportItem[] = groups.map((group) => {
    const plantMedia = group.linkedPlantId
      ? plantMediaById.get(group.linkedPlantId) ?? null
      : null;
    const mediaId = plantMedia ?? labelMediaByName.get(group.normalizedName) ?? null;
    const details = mediaId ? mediaDetails.get(mediaId) : null;

    return {
      imageIsIllustration: !plantMedia,
      imageSource: plantMedia ? "plant_media" : "generic_wikimedia",
      licenseCode: details?.licenseCode ?? null,
      linkedPlantId: group.linkedPlantId,
      mediaId,
      normalizedName: group.normalizedName,
      rawName: group.rawName,
      slug: group.slug,
      sourcePageUrl: details?.sourcePageUrl ?? null,
    };
  });
  const summary: PosterPlantImageSummary = {
    approvedImages: finalLabelMediaIds.length,
    attachmentCount: finalLabelMediaCount,
    catalogItems: groups.length,
    catalogItemsWithImage: finalPlantMediaCount + finalLabelMediaCount,
    duplicateMediaReused:
      (generic?.duplicateMediaReused ?? 0) +
      Math.max(0, finalLabelMediaCount - finalLabelMediaIds.length),
    exactImages: finalPlantMediaCount,
    failures,
    genericFallbackImages: groups.length - finalPlantMediaCount,
    illustrationImages: groups.length - finalPlantMediaCount,
    linkedPlants: groups.filter((group) => group.linkedPlantId).length,
    posterOnlyItems: groups.filter((group) => !group.linkedPlantId).length,
    retries: generic?.retries ?? 0,
    reusedPlantMedia: finalPlantMediaCount,
    searchedNames: groups.length - finalPlantMediaCount,
    storageBytes: labelStorageBytes || generic?.publicSize || 0,
    uniquePosterNames: groups.length,
    uploadedDerivatives: finalLabelMediaIds.length || generic?.publicUploaded || 0,
    uploadedOriginals: finalLabelMediaIds.length || generic?.originalUploaded || 0,
    wikimediaRequests: finalLabelMediaIds.length || (generic ? 1 : 0),
  };

  writeJson("data/media/reports/poster-plant-images.json", report);
  writeJson("data/media/reports/poster-plant-image-failures.json", failures);
  writeJson("data/media/reports/poster-plant-catalog-summary.json", summary);
  return summary;
}
