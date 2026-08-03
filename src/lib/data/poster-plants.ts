import { cache } from "react";
import { unstable_cache } from "next/cache";
import posterPlantManifest from "../../../data/media/manifests/poster-plant-catalog.json";
import { getPosterPlantPartCategory } from "../../../data/poster-plants/part-categories";
import { posterPlantSearchAliases } from "../../../data/poster-plants/search-aliases";
import { mapMediaAssetRowToPublicMedia } from "@/lib/data/media-mapper";
import type { MediaAssetRow } from "@/lib/data/media-mapper";
import {
  createSupabasePublicClient,
  getSupabaseConfig,
} from "@/lib/supabase/config";
import type {
  MediaRelevanceStatus,
  PlantCategory,
  PosterPlantCatalogItem,
  PublicImageKind,
} from "@/types";

export const POSTER_SOURCE_CODE = "KHB-POSTER-216-2026";
export const POSTER_CLAIMED_ENTRY_COUNT = 216;

type EntryRow = {
  collection_id: string;
  normalized_candidate_name: string | null;
  plant_id: string | null;
  poster_number: number;
  raw_plant_name: string;
};

type CollectionRow = {
  id: string;
  public_title: string;
};

type PlantRow = {
  id: string;
  category: string;
  canonical_local_name: string | null;
  local_name: string;
  scientific_name: string | null;
  slug: string;
};

type PlantMediaRow = {
  plant_id: string;
  media_assets: MediaAssetRow | null;
};

type LabelMediaRow = {
  normalized_name: string;
  label_as_illustration: boolean;
  media_assets: MediaAssetRow | null;
};

type QualityReviewRow = {
  duplicate_status: string;
  entity_key: string;
  quality_status: string;
  relevance_status: MediaRelevanceStatus;
};

type PosterGroup = {
  rawName: string;
  normalizedName: string;
  posterNumbers: number[];
  collections: Set<string>;
  linkedPlantId: string | null;
};

const POSTER_DESCRIPTION =
  "Nama tanaman ini tercatat dalam katalog edukasi Kampung Herbal Harmony, program pengenalan tanaman dan zona kesehatan di RT 009/RW 006 Kelurahan Berua.";
const HARMONY_SOURCE_LABEL = "Katalog Edukasi Kampung Herbal Harmony";

type ManifestPosterPlant = {
  rawName: string;
  normalizedName: string;
  slug: string;
  posterNumbers: number[];
  collections: string[];
};

export function normalizePosterName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function posterPlantSlug(value: string) {
  return normalizePosterName(value).replace(/\s+/g, "-");
}

function stableSlug(rawName: string, usedSlugs: Set<string>) {
  const baseSlug = posterPlantSlug(rawName) || "tanaman-poster";
  let slug = baseSlug;
  let suffix = 2;

  while (usedSlugs.has(slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  usedSlugs.add(slug);
  return slug;
}

function toPlantCategory(value: string | null | undefined): PlantCategory | null {
  if (!value) {
    return null;
  }

  const normalized = value.toLowerCase();

  if (normalized === "rimpang") return "Rimpang";
  if (normalized === "daun") return "Daun";
  if (normalized === "bunga") return "Bunga";
  if (normalized === "batang") return "Batang";
  return "Lainnya";
}

function mediaMapFromPlantRows(rows: PlantMediaRow[] | null) {
  const map = new Map<string, ReturnType<typeof mapMediaAssetRowToPublicMedia>>();

  for (const row of rows ?? []) {
    const media = row.media_assets
      ? mapMediaAssetRowToPublicMedia(row.media_assets)
      : null;

    if (media) {
      map.set(row.plant_id, media);
    }
  }

  return map;
}

function mediaMapFromLabelRows(rows: LabelMediaRow[] | null) {
  const mediaByName = new Map<
    string,
    {
      illustration: boolean;
      media: NonNullable<ReturnType<typeof mapMediaAssetRowToPublicMedia>>;
    }
  >();

  for (const row of rows ?? []) {
    const media = row.media_assets
      ? mapMediaAssetRowToPublicMedia(row.media_assets)
      : null;

    if (media) {
      mediaByName.set(row.normalized_name, {
        illustration: row.label_as_illustration,
        media,
      });
    }
  }

  return mediaByName;
}

function reviewMapFromRows(rows: QualityReviewRow[] | null) {
  return new Map((rows ?? []).map((row) => [row.entity_key, row]));
}

function imageKindFromRelevance(
  relevance: MediaRelevanceStatus,
): PublicImageKind {
  if (relevance === "exact" || relevance === "common_name_match") {
    return "specific";
  }

  if (
    relevance === "corrected_spelling_match" ||
    relevance === "material_match" ||
    relevance === "illustration_reference"
  ) {
    return "reference";
  }

  return "generic";
}

function inferRelevanceStatus(input: {
  hasPlantMedia: boolean;
  hasLabelMedia: boolean;
  isFallback: boolean;
  review?: QualityReviewRow | null;
}): MediaRelevanceStatus {
  if (input.review?.relevance_status) {
    return input.review.relevance_status;
  }

  if (input.hasPlantMedia) {
    return "exact";
  }

  if (input.hasLabelMedia && !input.isFallback) {
    return "illustration_reference";
  }

  return "generic_fallback";
}

function fallbackPosterCatalog() {
  return (posterPlantManifest as ManifestPosterPlant[]).map(
    (item) =>
      ({
        attributionText: null,
        category: null,
        changesMade: "Tidak ada perubahan.",
        collections: item.collections,
        creatorName: "Kampung Herbal Berua",
        description: POSTER_DESCRIPTION,
        id: item.normalizedName,
        image: null,
        imageIsIllustration: true,
        imageDuplicateStatus: "generic_reuse",
        imageKind: "generic",
        imageRelevanceStatus: "generic_fallback",
        licenseCode: null,
        licenseUrl: null,
        linkedPlantId: null,
        linkedPlantSlug: null,
        localName: item.rawName,
        normalizedName: item.normalizedName,
        partCategory: getPosterPlantPartCategory(item.normalizedName),
        posterNumbers: item.posterNumbers,
        posterOccurrenceCount: item.posterNumbers.length,
        rawName: item.rawName,
        searchAliases: posterPlantSearchAliases[item.normalizedName] ?? [],
        scientificName: null,
        slug: item.slug,
        sourceLabel: HARMONY_SOURCE_LABEL,
        sourcePageUrl: null,
      }) satisfies PosterPlantCatalogItem,
  );
}

const getCachedPosterPlantCatalog = unstable_cache(
  fetchPosterPlantCatalogFromDatabase,
  ["poster-plant-catalog"],
  { revalidate: 300 },
);

export const getPosterPlantCatalog = cache(getCachedPosterPlantCatalog);

async function fetchPosterPlantCatalogFromDatabase(): Promise<
  PosterPlantCatalogItem[]
> {
  const config = getSupabaseConfig();

  if (!config) {
    return fallbackPosterCatalog();
  }

  const client = createSupabasePublicClient(config);

  const { data: source, error: sourceError } = await client
    .from("plant_sources")
    .select("id")
    .eq("source_code", POSTER_SOURCE_CODE)
    .single();

  if (sourceError || !source) {
    return fallbackPosterCatalog();
  }

  const { data: entries, error: entriesError } = await client
    .from("plant_source_entries")
    .select("collection_id, normalized_candidate_name, plant_id, poster_number, raw_plant_name")
    .eq("source_id", source.id)
    .order("poster_number", { ascending: true });

  if (entriesError || !entries) {
    return fallbackPosterCatalog();
  }

  if (entries.length === 0) {
    return fallbackPosterCatalog();
  }

  const { data: collections } = await client
    .from("plant_collections")
    .select("id, public_title")
    .eq("source_id", source.id);
  const collectionById = new Map(
    ((collections ?? []) as CollectionRow[]).map((collection) => [
      collection.id,
      collection.public_title,
    ]),
  );
  const groups = new Map<string, PosterGroup>();

  for (const entry of entries as EntryRow[]) {
    const normalizedName =
      entry.normalized_candidate_name ?? normalizePosterName(entry.raw_plant_name);
    const existing = groups.get(normalizedName);
    const collectionTitle = collectionById.get(entry.collection_id);

    if (existing) {
      existing.posterNumbers.push(entry.poster_number);
      existing.linkedPlantId = existing.linkedPlantId ?? entry.plant_id;

      if (collectionTitle) {
        existing.collections.add(collectionTitle);
      }

      continue;
    }

    groups.set(normalizedName, {
      collections: new Set(collectionTitle ? [collectionTitle] : []),
      linkedPlantId: entry.plant_id,
      normalizedName,
      posterNumbers: [entry.poster_number],
      rawName: entry.raw_plant_name,
    });
  }

  const plantIds = Array.from(
    new Set(
      Array.from(groups.values())
        .map((group) => group.linkedPlantId)
        .filter((id): id is string => Boolean(id)),
    ),
  );
  const { data: plants } =
    plantIds.length > 0
      ? await client
          .from("plants")
          .select("id, category, canonical_local_name, local_name, scientific_name, slug")
          .in("id", plantIds)
      : { data: [] };
  const plantById = new Map(
    ((plants ?? []) as PlantRow[]).map((plant) => [plant.id, plant]),
  );
  const { data: plantMedia } =
    plantIds.length > 0
      ? await client
          .from("plant_media")
          .select("plant_id, media_assets(*)")
          .in("plant_id", plantIds)
          .eq("is_primary", true)
      : { data: [] };
  const plantMediaById = mediaMapFromPlantRows(
    plantMedia as PlantMediaRow[] | null,
  );
  const { data: labelMedia } = await client
    .from("plant_source_label_media")
    .select("normalized_name, label_as_illustration, media_assets(*)")
    .eq("source_id", source.id)
    .eq("is_primary", true);
  const labelMediaByName = mediaMapFromLabelRows(
    labelMedia as LabelMediaRow[] | null,
  );
  const { data: qualityReviews } = await client
    .from("media_quality_reviews")
    .select("entity_key, relevance_status, quality_status, duplicate_status")
    .eq("entity_type", "poster_plant");
  const qualityReviewBySlug = reviewMapFromRows(
    qualityReviews as QualityReviewRow[] | null,
  );
  const usedSlugs = new Set<string>();

  return Array.from(groups.values())
    .map((group) => {
      const plant = group.linkedPlantId
        ? plantById.get(group.linkedPlantId) ?? null
        : null;
      const plantMedia = group.linkedPlantId
        ? plantMediaById.get(group.linkedPlantId) ?? null
        : null;
      const labelMedia = labelMediaByName.get(group.normalizedName) ?? null;
      const media = plantMedia ?? labelMedia?.media ?? null;
      const isFallback = !media;
      const isIllustration = !plantMedia;
      const slug = stableSlug(group.rawName, usedSlugs);
      const review = qualityReviewBySlug.get(slug) ?? null;
      const relevanceStatus = inferRelevanceStatus({
        hasLabelMedia: Boolean(labelMedia),
        hasPlantMedia: Boolean(plantMedia),
        isFallback,
        review,
      });

      return {
        attributionText: media?.attributionText ?? null,
        category: toPlantCategory(plant?.category),
        changesMade: media?.changesMade ?? null,
        collections: Array.from(group.collections).sort((a, b) =>
          a.localeCompare(b, "id"),
        ),
        creatorName: media?.creatorName ?? null,
        description: POSTER_DESCRIPTION,
        id: group.normalizedName,
        image: media?.publicUrl ?? null,
        imageIsIllustration: isIllustration,
        imageDuplicateStatus: review?.duplicate_status ?? null,
        imageKind: imageKindFromRelevance(relevanceStatus),
        imageRelevanceStatus: relevanceStatus,
        licenseCode: media?.licenseCode ?? "Aset lokal",
        licenseUrl: media?.licenseUrl ?? null,
        linkedPlantId: group.linkedPlantId,
        linkedPlantSlug: plant?.slug ?? null,
        localName: plant?.canonical_local_name ?? plant?.local_name ?? group.rawName,
        normalizedName: group.normalizedName,
        partCategory: getPosterPlantPartCategory(group.normalizedName),
        posterNumbers: group.posterNumbers.sort((a, b) => a - b),
        posterOccurrenceCount: group.posterNumbers.length,
        rawName: group.rawName,
        searchAliases: posterPlantSearchAliases[group.normalizedName] ?? [],
        scientificName: plant?.scientific_name ?? null,
        slug,
        sourceLabel: HARMONY_SOURCE_LABEL,
        sourcePageUrl: media?.sourcePageUrl ?? null,
      } satisfies PosterPlantCatalogItem;
    })
    .sort((a, b) => a.rawName.localeCompare(b.rawName, "id"));
}

export async function getPosterPlantBySlug(slug: string) {
  const catalog = await getPosterPlantCatalog();
  return catalog.find((item) => item.slug === slug);
}

export async function getPosterPlantSlugs() {
  const catalog = await getPosterPlantCatalog();
  return catalog.map((item) => item.slug);
}
