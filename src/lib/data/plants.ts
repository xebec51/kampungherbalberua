import { cache } from "react";
import { plants as localPlants } from "@/data/plants";
import { getPrimaryPlantMediaMap } from "@/lib/data/media";
import { mapPlantRowToPlant } from "@/lib/data/plant-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plant } from "@/types";

const publicPlantQueryTimeoutMs = 5_000;

export type PublishedPlantDetail = {
  description: string;
  id: string;
  image: string | null;
  localName: string;
  scientificName: string | null;
  shortDescription: string;
  slug: string;
  sourceNotes: string | null;
};

export type PublishedPlantQrTarget = {
  localName: string;
  qrKey: string;
  slug: string;
};

async function withPublicPlantTimeout<T>(promise: Promise<T | null>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), publicPlantQueryTimeoutMs);
  });

  try {
    return await Promise.race([promise.catch(() => null), timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function visiblePlantImagePath(value: string | null | undefined) {
  if (!value || value.startsWith("/images/placeholders/")) {
    return null;
  }

  return value;
}

/**
 * Fetches published plants from Supabase. Returns null (never throws) when
 * Supabase is not configured, the client cannot be created, the query
 * fails, or the table has no rows yet — callers fall back to local data in
 * all of those cases so the catalog is never empty during the migration
 * phase.
 */
async function fetchPublishedPlantsFromDatabase(): Promise<Plant[] | null> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("plants")
    .select("*")
    .eq("content_status", "published")
    .order("featured", { ascending: false })
    .order("local_name", { ascending: true });

  if (error) {
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const plants = data.map(mapPlantRowToPlant);
  const mediaByPlantId = await getPrimaryPlantMediaMap(
    plants.map((plant) => plant.id),
  );

  return plants.map((plant) => {
    const media = mediaByPlantId.get(plant.id);

    return {
      ...plant,
      image: media?.publicUrl ?? plant.image,
    };
  });
}

/**
 * Resolves the single source of truth for a request: Supabase when it is
 * configured and returns rows, otherwise the local demonstration data.
 * Cached per request so multiple calls (e.g. list + detail helpers) don't
 * issue duplicate queries during the same render.
 */
const getPublishedPlantSource = cache(async (): Promise<Plant[]> => {
  const databasePlants = await withPublicPlantTimeout(fetchPublishedPlantsFromDatabase());
  return databasePlants ?? localPlants.filter((plant) => plant.published);
});

export async function getPublishedPlants(): Promise<Plant[]> {
  return getPublishedPlantSource();
}

export async function getFeaturedPlants(limit = 3): Promise<Plant[]> {
  const plants = await getPublishedPlantSource();
  return plants.filter((plant) => plant.featured).slice(0, limit);
}

export async function getPlantBySlug(slug: string): Promise<Plant | undefined> {
  const plants = await getPublishedPlantSource();
  return plants.find((plant) => plant.slug === slug);
}

export async function getPublishedPlantQrTargetByKey(
  qrKey: string,
): Promise<PublishedPlantQrTarget | undefined> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return undefined;
  }

  const { data, error } = await client
    .from("plants")
    .select("qr_key, slug, local_name")
    .eq("content_status", "published")
    .eq("qr_key", qrKey)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    localName: data.local_name,
    qrKey: data.qr_key,
    slug: data.slug,
  };
}

export async function getPublishedPlantDetailBySlug(
  slug: string,
): Promise<PublishedPlantDetail | undefined> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return undefined;
  }

  const { data, error } = await client
    .from("plants")
    .select("*")
    .eq("content_status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  const mediaByPlantId = await getPrimaryPlantMediaMap([data.id]);
  const media = mediaByPlantId.get(data.id);

  return {
    description: data.description,
    id: data.id,
    image: media?.publicUrl ?? visiblePlantImagePath(data.image_path),
    localName: data.local_name,
    scientificName: data.scientific_name,
    shortDescription: data.short_description,
    slug: data.slug,
    sourceNotes: data.source_notes,
  };
}

export async function getPlantSlugs(): Promise<string[]> {
  const plants = await getPublishedPlantSource();
  return plants.map((plant) => plant.slug);
}
