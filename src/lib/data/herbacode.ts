import { cache } from "react";
import localHerbaCodeData from "../../../data/herbacode/herbacode-data.json";
import { plants as localPlants } from "@/data/plants";
import { getHealthZoneShortDescription } from "@/lib/content/health-zone-descriptions";
import { getPrimaryPlantMediaMap } from "@/lib/data/media";
import { getRestoredStreetNamesByHerbaCodeZoneSlug } from "@/lib/data/streets";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";
import type {
  HerbaCodePlantProfile,
  HerbaCodePlantZoneEntry,
  HerbaCodeZoneDetail,
  HerbaCodeZoneSummary,
  PublicMediaAsset,
} from "@/types";

type HerbaCodeRow =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Row"] & {
    health_zones: {
      id: string;
      slug: string;
      short_description: string;
      zone_code: string;
      zone_name: string;
    } | null;
    plants: {
      id: string;
      description: string;
      image_path: string | null;
      local_name: string;
      other_names: string[];
      scientific_name: string | null;
      short_description: string;
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
const localPlantBySlug = new Map(
  localPlants
    .filter((plant) => plant.published)
    .map((plant) => [plant.slug, plant]),
);

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

function cleanPlantText(value: string | null | undefined) {
  const text = value?.trim();

  if (!text) {
    return null;
  }

  if (
    /data demonstrasi|bersifat demonstrasi|informasi ini masih berupa materi awal|sedang dipetakan|menunggu verifikasi|^HerbaCode Kampung Herbal Harmony:/i.test(
      text,
    )
  ) {
    return null;
  }

  return text;
}

function firstSentence(value: string | null | undefined) {
  const text = cleanPlantText(value);

  if (!text) {
    return null;
  }

  const match = text.match(/^.+?[.!?](?:\s|$)/);

  return (match?.[0] ?? text).trim();
}

function resolvePlantShortDescription(input: {
  description?: string | null;
  localDescription?: string | null;
  localShortDescription?: string | null;
  shortDescription?: string | null;
}) {
  return (
    cleanPlantText(input.shortDescription) ??
    cleanPlantText(input.localShortDescription) ??
    firstSentence(input.description) ??
    firstSentence(input.localDescription)
  );
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
    zoneShortDescription: getHealthZoneShortDescription(
      row.health_zones.slug,
      row.health_zones.short_description,
    ),
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
      zoneShortDescription: getHealthZoneShortDescription(
        zone?.slug ?? entry.zoneSlug,
      ),
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
  mediaByPlantId?: Map<string, PublicMediaAsset>;
  rowByPlantId?: Map<
    string,
    {
      description: string | null;
      image_path: string | null;
      local_name: string;
      other_names: string[];
      scientific_name: string | null;
      short_description: string | null;
      slug: string;
    }
  >;
}) {
  const grouped = new Map<string, HerbaCodePlantProfile>();

  for (const entry of sortEntries(input.entries)) {
    const row = input.rowByPlantId?.get(entry.plantId);
    const localPlant = localPlantBySlug.get(row?.slug ?? entry.plantSlug);
    const media = input.mediaByPlantId?.get(entry.plantId) ?? null;
    const image =
      media?.publicUrl ??
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
      imageMedia: media,
      localName: row?.local_name ?? entry.plantLocalName,
      scientificName: row?.scientific_name ?? entry.plantScientificName,
      shortDescription: resolvePlantShortDescription({
        description: row?.description,
        localDescription: localPlant?.description,
        localShortDescription: localPlant?.shortDescription,
        shortDescription: row?.short_description,
      }),
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
      "*, plants!inner(id, slug, local_name, scientific_name, other_names, image_path, short_description, description, content_status), health_zones(id, zone_code, slug, zone_name, short_description)",
    )
    .eq("content_status", "published")
    .eq("plants.content_status", "published")
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
          description: row.plants?.description ?? null,
          image_path: row.plants?.image_path ?? null,
          local_name: row.plants?.local_name ?? "",
          other_names: row.plants?.other_names ?? [],
          scientific_name: row.plants?.scientific_name ?? null,
          short_description: row.plants?.short_description ?? null,
          slug: row.plants?.slug ?? "",
        },
      ]),
  );
  const mediaByPlantId = await getPrimaryPlantMediaMap(
    Array.from(new Set(entries.map((entry) => entry.plantId))),
  );

  return buildProfiles({
    entries,
    mediaByPlantId,
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
      shortDescription: getHealthZoneShortDescription(
        entry.zoneSlug,
        entry.zoneShortDescription,
      ),
      streetNames: [],
      title: entry.zoneTitle,
      zoneCode: entry.zoneCode,
    });
  }

  const summaries = await Promise.all(
    Array.from(zones.values()).map(async (zone) => ({
      ...zone,
      streetNames: await getRestoredStreetNamesByHerbaCodeZoneSlug(zone.slug),
    })),
  );

  return summaries.sort((left, right) =>
    left.zoneCode.localeCompare(right.zoneCode, "id"),
  );
}

export function getLocalHerbaCodeZoneQrTargetBySlug(slug: string) {
  if (/^khb-z[0-9]{2}$/i.test(slug)) {
    return undefined;
  }

  const zone = localData.zones.find((item) => item.slug === slug);

  return zone
    ? {
        qrKey: zone.slug,
        slug: zone.slug,
        zoneCode: zone.zoneCode,
      }
    : undefined;
}

export async function getHerbaCodeZoneBySlug(
  slug: string,
): Promise<HerbaCodeZoneDetail | undefined> {
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
    plantCount: entries.length,
    slug: firstEntry.zoneSlug,
    shortDescription: getHealthZoneShortDescription(
      firstEntry.zoneSlug,
      firstEntry.zoneShortDescription,
    ),
    streetNames: await getRestoredStreetNamesByHerbaCodeZoneSlug(
      firstEntry.zoneSlug,
    ),
    title: firstEntry.zoneTitle,
    zoneCode: firstEntry.zoneCode,
  };
}
