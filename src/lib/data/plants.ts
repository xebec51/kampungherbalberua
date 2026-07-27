import { cache } from "react";
import { plants as localPlants } from "@/data/plants";
import { mapPlantRowToPlant } from "@/lib/data/plant-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Plant } from "@/types";

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

  return data.map(mapPlantRowToPlant);
}

/**
 * Resolves the single source of truth for a request: Supabase when it is
 * configured and returns rows, otherwise the local demonstration data.
 * Cached per request so multiple calls (e.g. list + detail helpers) don't
 * issue duplicate queries during the same render.
 */
const getPublishedPlantSource = cache(async (): Promise<Plant[]> => {
  const databasePlants = await fetchPublishedPlantsFromDatabase();
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

export async function getPlantSlugs(): Promise<string[]> {
  const plants = await getPublishedPlantSource();
  return plants.map((plant) => plant.slug);
}
