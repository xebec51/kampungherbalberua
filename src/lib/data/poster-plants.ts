import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { mapMediaAssetRowToPublicMedia } from "@/lib/data/media-mapper";
import type { MediaAssetRow } from "@/lib/data/media-mapper";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";
import type { PlantCategory, PosterPlantCatalogItem } from "@/types";

export const POSTER_SOURCE_CODE = "KHB-POSTER-216-2026";

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

type PosterGroup = {
  rawName: string;
  normalizedName: string;
  posterNumbers: number[];
  collections: Set<string>;
  linkedPlantId: string | null;
};

const POSTER_DESCRIPTION =
  "Nama ini dicantumkan pada poster Kampung Herbal Harmony. Informasi identitas dan materi edukasi dapat dilengkapi setelah proses verifikasi.";

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

export const getPosterPlantCatalog = cache(async () => {
  const config = getSupabaseConfig();

  if (!config) {
    return [] as PosterPlantCatalogItem[];
  }

  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });

  const { data: source, error: sourceError } = await client
    .from("plant_sources")
    .select("id")
    .eq("source_code", POSTER_SOURCE_CODE)
    .single();

  if (sourceError || !source) {
    return [] as PosterPlantCatalogItem[];
  }

  const { data: entries, error: entriesError } = await client
    .from("plant_source_entries")
    .select("collection_id, normalized_candidate_name, plant_id, poster_number, raw_plant_name")
    .eq("source_id", source.id)
    .order("poster_number", { ascending: true });

  if (entriesError || !entries) {
    return [] as PosterPlantCatalogItem[];
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
      const isIllustration = plantMedia ? false : (labelMedia?.illustration ?? true);
      const slug = stableSlug(group.rawName, usedSlugs);

      return {
        attributionText: media?.attributionText ?? null,
        category: toPlantCategory(plant?.category),
        collections: Array.from(group.collections).sort((a, b) =>
          a.localeCompare(b, "id"),
        ),
        description: POSTER_DESCRIPTION,
        id: group.normalizedName,
        image: media?.publicUrl ?? null,
        imageIsIllustration: isIllustration,
        licenseCode: media?.licenseCode ?? null,
        linkedPlantId: group.linkedPlantId,
        linkedPlantSlug: plant?.slug ?? null,
        localName: plant?.canonical_local_name ?? plant?.local_name ?? group.rawName,
        normalizedName: group.normalizedName,
        posterNumbers: group.posterNumbers.sort((a, b) => a - b),
        posterOccurrenceCount: group.posterNumbers.length,
        rawName: group.rawName,
        scientificName: plant?.scientific_name ?? null,
        slug,
        sourceLabel: "Peta Tanaman Obat Kampung Herbal Harmony",
        sourcePageUrl: media?.sourcePageUrl ?? null,
      } satisfies PosterPlantCatalogItem;
    })
    .sort((a, b) => a.rawName.localeCompare(b.rawName, "id"));
});

export async function getPosterPlantBySlug(slug: string) {
  const catalog = await getPosterPlantCatalog();
  return catalog.find((item) => item.slug === slug);
}

export async function getPosterPlantSlugs() {
  const catalog = await getPosterPlantCatalog();
  return catalog.map((item) => item.slug);
}
