import { unstable_cache } from "next/cache";
import { cache } from "react";
import { healthConditions as fallbackHealthConditions } from "@/data/health-conditions";
import {
  createSupabasePublicClient,
  getSupabaseConfig,
} from "@/lib/supabase/config";
import type { HealthCondition, HealthConditionPlantLink } from "@/types";

type HealthConditionPlantRow = {
  display_name: string;
  sort_order: number;
  plants: { slug: string; content_status: string } | null;
};

type HealthConditionRow = {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string;
  benefits: string[];
  sort_order: number;
  health_condition_plants: HealthConditionPlantRow[];
};

function mapRowToHealthCondition(row: HealthConditionRow): HealthCondition {
  const linkedPlants: HealthConditionPlantLink[] = [...row.health_condition_plants]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((link) => ({
      displayName: link.display_name,
      // A link whose plant is missing or no longer published renders as a
      // plain unlinked label rather than a dead /tanaman/[slug] link.
      plantSlug: link.plants && link.plants.content_status === "published" ? link.plants.slug : null,
    }));

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    shortDescription: row.short_description,
    description: row.description,
    benefits: row.benefits,
    sortOrder: row.sort_order,
    linkedPlants,
  };
}

// This whole module has to stay cookie-free, matching src/lib/data/products.ts:
// /penyakit/[slug] statically generates via generateStaticParams, which runs
// at build time with no request/cookies at all.
async function fetchHealthConditionsFromDatabase(): Promise<HealthCondition[]> {
  const config = getSupabaseConfig();

  if (!config) {
    return fallbackHealthConditions;
  }

  const client = createSupabasePublicClient(config);

  const { data, error } = await client
    .from("health_conditions")
    .select(
      "id, slug, name, short_description, description, benefits, sort_order, health_condition_plants(display_name, sort_order, plants(slug, content_status))",
    )
    .order("sort_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return fallbackHealthConditions;
  }

  return (data as HealthConditionRow[]).map(mapRowToHealthCondition);
}

const getCachedHealthConditions = unstable_cache(
  fetchHealthConditionsFromDatabase,
  ["health-conditions-catalog"],
  { revalidate: 300 },
);

export const getHealthConditions = cache(getCachedHealthConditions);

export const getHealthConditionBySlug = cache(async (slug: string) => {
  const healthConditions = await getHealthConditions();
  return healthConditions.find((healthCondition) => healthCondition.slug === slug);
});

export const getHealthConditionSlugs = cache(async () => {
  const healthConditions = await getHealthConditions();
  return healthConditions.map((healthCondition) => healthCondition.slug);
});

export type PlantHealthConditionLink = {
  name: string;
  slug: string;
};

// Reverse lookup for the /tanaman/[slug] cross-link -- kept cookie-free for
// the same reason as the rest of this module (that page also statically
// generates via generateStaticParams). Takes a plant slug (not id) so the
// same value works against both the database (filtered through the
// embedded plants relation) and the local fallback (which has no real
// database ids at all) -- the plant detail page already has the slug from
// its own route params, so this also avoids an extra id lookup at the call
// site.
export const getHealthConditionsForPlant = cache(
  async (plantSlug: string): Promise<PlantHealthConditionLink[]> => {
    const config = getSupabaseConfig();

    if (!config) {
      return fallbackHealthConditions
        .filter((condition) =>
          condition.linkedPlants.some((link) => link.plantSlug === plantSlug),
        )
        .map((condition) => ({ name: condition.name, slug: condition.slug }));
    }

    const client = createSupabasePublicClient(config);
    const { data, error } = await client
      .from("health_condition_plants")
      .select("health_conditions(slug, name), plants!inner(slug)")
      .eq("plants.slug", plantSlug);

    if (error || !data) {
      return [];
    }

    return (
      data as Array<{ health_conditions: { slug: string; name: string } | null }>
    )
      .map((row) => row.health_conditions)
      .filter((condition): condition is { slug: string; name: string } => Boolean(condition))
      .map((condition) => ({ name: condition.name, slug: condition.slug }));
  },
);
