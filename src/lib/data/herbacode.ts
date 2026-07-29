import { cache } from "react";
import localHerbaCodeData from "../../../data/herbacode/herbacode-data.json";
import { getPrimaryPlantMediaMap } from "@/lib/data/media";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  HerbaCodePlantProfile,
  HerbaCodePlantZoneEntry,
  HerbaCodeZoneSummary,
} from "@/types";

type HerbaCodeRow =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Row"] & {
    health_zones: {
      id: string;
      slug: string;
      zone_code: string;
      zone_name: string;
    } | null;
    plants: {
      id: string;
      image_path: string | null;
      local_name: string;
      other_names: string[];
      scientific_name: string | null;
      slug: string;
    } | null;
  };

type LocalHerbaCodeData = {
  entries: Array<{
    activeCompounds: string[];
    benefits: string[];
    cultivationTechniques: string[];
    entryKey: string;
    entryOrder: number;
    localName: string;
    plantKey: string;
    plantSlug: string;
    preparationMethods: string[];
    scientificName: string | null;
    usedParts: string[];
    warnings: string[];
    zoneCode: string;
    zoneSlug: string;
    zoneTitle: string;
  }>;
  sourceTitle: string;
  uniquePlants: Array<{
    aliases: string[];
    localName: string;
    plantKey: string;
    scientificName: string | null;
    slug: string;
  }>;
  zones: Array<{
    slug: string;
    title: string;
    zoneCode: string;
  }>;
};

const herbaCodeQueryTimeoutMs = 5_000;
const localData = localHerbaCodeData as LocalHerbaCodeData;

async function withHerbaCodeTimeout<T>(promise: Promise<T | null>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), herbaCodeQueryTimeoutMs);
  });

  try {
    return await Promise.race([promise.catch(() => null), timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function visibleImagePath(value: string | null | undefined) {
  if (!value || value.startsWith("/images/placeholders/")) {
    return null;
  }

  return value;
}

function mapRowToEntry(row: HerbaCodeRow): HerbaCodePlantZoneEntry | null {
  if (!row.plants || !row.health_zones) {
    return null;
  }

  return {
    activeCompounds: row.active_compounds,
    benefits: row.benefits,
    cultivationTechniques: row.cultivation_techniques,
    entryOrder: row.entry_order,
    id: row.id,
    localName: row.local_name,
    plantId: row.plant_id,
    plantLocalName: row.plants.local_name,
    plantScientificName: row.plants.scientific_name,
    plantSlug: row.plants.slug,
    preparationMethods: row.preparation_methods,
    scientificName: row.scientific_name,
    sourceDocumentName: row.source_document_name,
    usedParts: row.used_parts,
    warnings: row.warnings,
    zoneCode: row.health_zones.zone_code,
    zoneId: row.health_zone_id,
    zoneSlug: row.health_zones.slug,
    zoneTitle: row.health_zones.zone_name,
  };
}

function localEntries(): HerbaCodePlantZoneEntry[] {
  const plantByKey = new Map(localData.uniquePlants.map((plant) => [plant.plantKey, plant]));
  const zoneByCode = new Map(localData.zones.map((zone) => [zone.zoneCode, zone]));

  return localData.entries.map((entry) => {
    const plant = plantByKey.get(entry.plantKey);
    const zone = zoneByCode.get(entry.zoneCode);
    const plantSlug = plant?.slug ?? entry.plantSlug;

    return {
      activeCompounds: entry.activeCompounds,
      benefits: entry.benefits,
      cultivationTechniques: entry.cultivationTechniques,
      entryOrder: entry.entryOrder,
      id: entry.entryKey,
      localName: entry.localName,
      plantId: `herbacode-${plantSlug}`,
      plantLocalName: plant?.localName ?? entry.localName,
      plantScientificName: plant?.scientificName ?? entry.scientificName,
      plantSlug,
      preparationMethods: entry.preparationMethods,
      scientificName: entry.scientificName,
      sourceDocumentName: localData.sourceTitle,
      usedParts: entry.usedParts,
      warnings: entry.warnings,
      zoneCode: entry.zoneCode,
      zoneId: entry.zoneCode,
      zoneSlug: zone?.slug ?? entry.zoneSlug,
      zoneTitle: zone?.title ?? entry.zoneTitle,
    } satisfies HerbaCodePlantZoneEntry;
  });
}

function sortEntries(entries: HerbaCodePlantZoneEntry[]) {
  return [...entries].sort((left, right) => {
    const zoneOrder = left.zoneCode.localeCompare(right.zoneCode, "id");

    if (zoneOrder !== 0) {
      return zoneOrder;
    }

    return left.entryOrder - right.entryOrder;
  });
}

function buildProfiles(input: {
  entries: HerbaCodePlantZoneEntry[];
  imageByPlantId?: Map<string, string | null>;
  rowByPlantId?: Map<
    string,
    {
      image_path: string | null;
      local_name: string;
      other_names: string[];
      scientific_name: string | null;
      slug: string;
    }
  >;
}) {
  const grouped = new Map<string, HerbaCodePlantProfile>();

  for (const entry of sortEntries(input.entries)) {
    const row = input.rowByPlantId?.get(entry.plantId);
    const image =
      input.imageByPlantId?.get(entry.plantId) ??
      visibleImagePath(row?.image_path) ??
      null;
    const existing = grouped.get(entry.plantId);

    if (existing) {
      existing.zoneEntries.push(entry);
      continue;
    }

    grouped.set(entry.plantId, {
      aliases: row?.other_names ?? [],
      id: entry.plantId,
      image,
      localName: row?.local_name ?? entry.plantLocalName,
      scientificName: row?.scientific_name ?? entry.plantScientificName,
      slug: row?.slug ?? entry.plantSlug,
      sourceDocumentName: entry.sourceDocumentName,
      zoneEntries: [entry],
    });
  }

  return Array.from(grouped.values()).sort((left, right) =>
    left.localName.localeCompare(right.localName, "id"),
  );
}

async function fetchHerbaCodeProfilesFromDatabase() {
  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("herbacode_plant_zone_entries")
    .select(
      "*, plants(id, slug, local_name, scientific_name, other_names, image_path), health_zones(id, zone_code, slug, zone_name)",
    )
    .eq("content_status", "published")
    .order("zone_code", { ascending: true })
    .order("entry_order", { ascending: true });

  if (error || !data || data.length === 0) {
    return null;
  }

  const rows = data as HerbaCodeRow[];
  const entries = rows
    .map(mapRowToEntry)
    .filter((entry): entry is HerbaCodePlantZoneEntry => Boolean(entry));
  const plantRows = new Map(
    rows
      .filter((row) => row.plants)
      .map((row) => [
        row.plant_id,
        {
          image_path: row.plants?.image_path ?? null,
          local_name: row.plants?.local_name ?? "",
          other_names: row.plants?.other_names ?? [],
          scientific_name: row.plants?.scientific_name ?? null,
          slug: row.plants?.slug ?? "",
        },
      ]),
  );
  const mediaByPlantId = await getPrimaryPlantMediaMap(
    Array.from(new Set(entries.map((entry) => entry.plantId))),
  );
  const imageByPlantId = new Map(
    Array.from(mediaByPlantId.entries()).map(([plantId, media]) => [
      plantId,
      media.publicUrl,
    ]),
  );

  return buildProfiles({
    entries,
    imageByPlantId,
    rowByPlantId: plantRows,
  });
}

const getHerbaCodeProfilesSource = cache(async () => {
  const databaseProfiles = await withHerbaCodeTimeout(
    fetchHerbaCodeProfilesFromDatabase(),
  );

  return databaseProfiles ?? buildProfiles({ entries: localEntries() });
});

export async function getHerbaCodePlantCatalog() {
  return getHerbaCodeProfilesSource();
}

export async function getFeaturedHerbaCodePlants(limit = 3) {
  const plants = await getHerbaCodeProfilesSource();

  return [...plants]
    .sort((left, right) => right.zoneEntries.length - left.zoneEntries.length)
    .slice(0, limit);
}

export async function getHerbaCodePlantBySlug(slug: string) {
  const plants = await getHerbaCodeProfilesSource();

  return plants.find((plant) => plant.slug === slug);
}

export async function getHerbaCodePlantSlugs() {
  const plants = await getHerbaCodeProfilesSource();

  return plants.map((plant) => plant.slug);
}

export async function getHerbaCodeZoneSummaries(): Promise<HerbaCodeZoneSummary[]> {
  const entries = (await getHerbaCodeProfilesSource()).flatMap(
    (plant) => plant.zoneEntries,
  );
  const zones = new Map<string, HerbaCodeZoneSummary>();

  for (const entry of entries) {
    const existing = zones.get(entry.zoneCode);

    if (existing) {
      existing.plantCount += 1;
      continue;
    }

    zones.set(entry.zoneCode, {
      id: entry.zoneId,
      plantCount: 1,
      slug: entry.zoneSlug,
      title: entry.zoneTitle,
      zoneCode: entry.zoneCode,
    });
  }

  return Array.from(zones.values()).sort((left, right) =>
    left.zoneCode.localeCompare(right.zoneCode, "id"),
  );
}

export async function getHerbaCodeZoneBySlug(slug: string) {
  const profiles = await getHerbaCodeProfilesSource();
  const entries = profiles
    .flatMap((plant) => plant.zoneEntries)
    .filter((entry) => entry.zoneSlug === slug);
  const firstEntry = entries[0];

  if (!firstEntry) {
    return undefined;
  }

  return {
    entries: sortEntries(entries),
    id: firstEntry.zoneId,
    slug: firstEntry.zoneSlug,
    title: firstEntry.zoneTitle,
    zoneCode: firstEntry.zoneCode,
  };
}
