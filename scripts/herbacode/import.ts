import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentStatus,
  Database,
  PlantCategory,
  ValidationStatus,
} from "../../src/lib/supabase/database.types.ts";
import {
  extractHerbaCodeFromDocx,
  HERBACODE_DATA_PATH,
  HERBACODE_DOCUMENT_PATH,
  HERBACODE_REPORT_PATH,
  HERBACODE_SOURCE_CODE,
  HERBACODE_SOURCE_TITLE,
  normalizeHerbaCodeName,
  writeJsonFile,
  type HerbaCodeData,
  type HerbaCodeEntry,
  type HerbaCodePlant,
} from "./extract.ts";

type PlantRow = Pick<
  Database["public"]["Tables"]["plants"]["Row"],
  | "canonical_local_name"
  | "category"
  | "featured"
  | "id"
  | "identification_status"
  | "image_path"
  | "local_name"
  | "other_names"
  | "plant_code"
  | "scientific_name"
  | "slug"
>;

type PlantNameRow = Pick<
  Database["public"]["Tables"]["plant_names"]["Row"],
  "name" | "normalized_name" | "plant_id"
>;

type ExistingPlantMatch = {
  matchKey: string;
  method: "alias" | "scientific";
  plantId: string;
};

type ImportPlanPlant = {
  entries: HerbaCodeEntry[];
  existingMatch: ExistingPlantMatch | null;
  plant: HerbaCodePlant;
};

export type HerbaCodeImportSummary = {
  corrections: HerbaCodeData["corrections"];
  documentEntryCount: number;
  dryRun: boolean;
  failedMappings: Array<{
    localName: string;
    reason: string;
    zoneTitle: string;
  }>;
  matchedUniquePlants: number;
  newPlants: number;
  relationCount: number;
  sourceCode: string;
  sourceDocumentName: string;
  title: string;
  uniquePlantsInDocument: number;
  zonesImported: number;
};

type PlantUpsert = Database["public"]["Tables"]["plants"]["Insert"];
type HealthZoneUpsert = Database["public"]["Tables"]["health_zones"]["Insert"];
type HerbaCodeEntryUpsert =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Insert"];
type PlantNameUpsert = Database["public"]["Tables"]["plant_names"]["Insert"];

const publishedStatus: ContentStatus = "published";
const validationStatus: ValidationStatus = "pending";

function unique(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

function mergeTextArrays(...arrays: Array<string[] | null | undefined>) {
  return unique(arrays.flatMap((array) => array ?? []));
}

function normalizeSlugAsName(value: string) {
  return normalizeHerbaCodeName(value.replace(/-/g, " "));
}

function getPrimaryName(value: string) {
  return value.replace(/\s*\([^)]*\)\s*/g, " ").replace(/\s+/g, " ").trim();
}

function buildExistingPlantIndexes(
  plants: PlantRow[],
  plantNames: PlantNameRow[],
) {
  const aliases = new Map<string, string>();
  const scientific = new Map<string, string>();
  const plantById = new Map(plants.map((plant) => [plant.id, plant]));

  for (const plant of plants) {
    const candidates = [
      plant.local_name,
      plant.canonical_local_name,
      plant.slug,
      normalizeSlugAsName(plant.slug),
      ...plant.other_names,
    ];

    for (const candidate of candidates) {
      const normalized = normalizeHerbaCodeName(candidate ?? "");

      if (normalized && !aliases.has(normalized)) {
        aliases.set(normalized, plant.id);
      }
    }

    if (plant.scientific_name) {
      scientific.set(normalizeHerbaCodeName(plant.scientific_name), plant.id);
    }
  }

  for (const name of plantNames) {
    if (name.plant_id && !aliases.has(name.normalized_name)) {
      aliases.set(name.normalized_name, name.plant_id);
    }

    if (name.plant_id) {
      const normalizedName = normalizeHerbaCodeName(name.name);

      if (normalizedName && !aliases.has(normalizedName)) {
        aliases.set(normalizedName, name.plant_id);
      }
    }
  }

  return { aliases, plantById, scientific };
}

function findExistingPlantMatch(
  plant: HerbaCodePlant,
  indexes: ReturnType<typeof buildExistingPlantIndexes>,
) {
  const aliasCandidates = unique([
    plant.localName,
    getPrimaryName(plant.localName),
    plant.slug,
    normalizeSlugAsName(plant.slug),
    ...plant.aliases,
    ...plant.aliases.map(getPrimaryName),
  ]);

  for (const candidate of aliasCandidates) {
    const normalized = normalizeHerbaCodeName(candidate);
    const plantId = indexes.aliases.get(normalized);

    if (plantId) {
      return {
        matchKey: candidate,
        method: "alias",
        plantId,
      } satisfies ExistingPlantMatch;
    }
  }

  if (plant.scientificName) {
    const normalizedScientific = normalizeHerbaCodeName(plant.scientificName);
    const plantId = indexes.scientific.get(normalizedScientific);

    if (plantId) {
      return {
        matchKey: plant.scientificName,
        method: "scientific",
        plantId,
      } satisfies ExistingPlantMatch;
    }
  }

  return null;
}

function categoryFromUsedParts(entries: HerbaCodeEntry[]): PlantCategory {
  const text = entries.flatMap((entry) => entry.usedParts).join(" ").toLowerCase();

  if (text.includes("rimpang")) return "rimpang";
  if (text.includes("daun") || text.includes("herba")) return "daun";
  if (text.includes("bunga") || text.includes("kelopak")) return "bunga";
  if (text.includes("batang") || text.includes("kulit")) return "batang";
  return "lainnya";
}

function buildSourceNotes() {
  return HERBACODE_SOURCE_TITLE;
}

function buildPlantDescription(plant: HerbaCodePlant) {
  return `${HERBACODE_SOURCE_TITLE}: ${plant.localName}.`;
}

function buildPlantUpsert(
  plan: ImportPlanPlant,
  existing: PlantRow | null,
  nowIso: string,
) {
  const entries = plan.entries;
  const aliases = unique([
    ...(existing?.other_names ?? []),
    ...plan.plant.aliases,
  ]).filter(
    (alias) =>
      normalizeHerbaCodeName(alias) !== normalizeHerbaCodeName(plan.plant.localName),
  );
  const row: PlantUpsert = {
    canonical_local_name: plan.plant.localName,
    category: categoryFromUsedParts(entries),
    care_instructions: [],
    content_status: publishedStatus,
    description: buildPlantDescription(plan.plant),
    featured: existing?.featured ?? plan.entries.length > 1,
    identification_status: existing?.identification_status ?? "candidate",
    image_path: existing?.image_path ?? null,
    location_status: null,
    local_name: plan.plant.localName,
    other_names: aliases,
    plant_code: existing?.plant_code ?? `herbacode-${plan.plant.slug}`,
    preparation: [],
    published_at: nowIso,
    scientific_name: plan.plant.scientificName,
    short_description: buildPlantDescription(plan.plant),
    slug: existing?.slug ?? plan.plant.slug,
    source_notes: buildSourceNotes(),
    traditional_uses: [],
    used_parts: mergeTextArrays(...entries.map((entry) => entry.usedParts)),
    validation_status: validationStatus,
    warnings: [],
  };

  if (existing) {
    row.id = existing.id;
  }

  return row;
}

function buildHealthZoneUpsert(zone: HerbaCodeData["zones"][number], nowIso: string) {
  return {
    block_ranges: [],
    content_status: publishedStatus,
    educational_points: [],
    featured: zone.displayOrder <= 3,
    health_topic: zone.title,
    healthy_habits: [],
    image_path: null,
    important_notes: [],
    location_notes: null,
    overview: zone.title,
    program_name: "Kampung Herbal Harmony",
    published_at: nowIso,
    short_description: zone.title,
    sign_text: zone.title,
    slug: zone.slug,
    source_notes: [HERBACODE_SOURCE_TITLE],
    street_name: zone.title,
    validation_status: validationStatus,
    zone_code: zone.zoneCode,
    zone_name: zone.title,
  } satisfies HealthZoneUpsert;
}

function buildCorrectionNotes(entry: HerbaCodeEntry) {
  if (!entry.titleCorrection) {
    return [];
  }

  return [
    `${entry.titleCorrection.rawTitle} -> ${entry.titleCorrection.correctedTitle}: ${entry.titleCorrection.reason}`,
  ];
}

function buildPlantPlans(
  data: HerbaCodeData,
  indexes: ReturnType<typeof buildExistingPlantIndexes>,
) {
  return data.uniquePlants.map((plant) => {
    const entries = data.entries.filter((entry) => entry.plantKey === plant.plantKey);

    return {
      entries,
      existingMatch: findExistingPlantMatch(plant, indexes),
      plant,
    } satisfies ImportPlanPlant;
  });
}

async function readExistingPlants(supabase: SupabaseClient<Database>) {
  const { data: plants, error: plantError } = await supabase
    .from("plants")
    .select("id, slug, local_name, canonical_local_name, scientific_name, other_names, category, image_path, featured, identification_status, plant_code");

  if (plantError) {
    throw new Error(`Gagal membaca katalog tanaman existing: ${plantError.message}`);
  }

  const { data: plantNames, error: plantNameError } = await supabase
    .from("plant_names")
    .select("plant_id, name, normalized_name");

  if (plantNameError) {
    throw new Error(`Gagal membaca alias tanaman existing: ${plantNameError.message}`);
  }

  return {
    plantNames: (plantNames ?? []) as PlantNameRow[],
    plants: (plants ?? []) as PlantRow[],
  };
}

function buildSummary(
  data: HerbaCodeData,
  plans: ImportPlanPlant[],
  dryRun: boolean,
): HerbaCodeImportSummary {
  const failedMappings: HerbaCodeImportSummary["failedMappings"] = [];

  return {
    corrections: data.corrections,
    documentEntryCount: data.entries.length,
    dryRun,
    failedMappings,
    matchedUniquePlants: plans.filter((plan) => plan.existingMatch).length,
    newPlants: plans.filter((plan) => !plan.existingMatch).length,
    relationCount: data.entries.length,
    sourceCode: HERBACODE_SOURCE_CODE,
    sourceDocumentName: HERBACODE_SOURCE_TITLE,
    title: HERBACODE_SOURCE_TITLE,
    uniquePlantsInDocument: data.uniquePlants.length,
    zonesImported: data.zones.length,
  };
}

async function upsertSource(
  supabase: SupabaseClient<Database>,
  data: HerbaCodeData,
) {
  const { data: source, error } = await supabase
    .from("plant_sources")
    .upsert(
      {
        claimed_total: data.entries.length,
        content_status: publishedStatus,
        description:
          "Konten HerbaCode dari dokumen sumber untuk zona kesehatan dan relasi tanaman-zona Kampung Herbal Harmony.",
        file_reference: HERBACODE_DOCUMENT_PATH,
        numbering_notes:
          data.corrections.length > 0
            ? data.corrections
                .map(
                  (correction) =>
                    `${correction.rawTitle} -> ${correction.correctedTitle}`,
                )
                .join("; ")
            : null,
        observed_entry_total: data.entries.length,
        source_code: HERBACODE_SOURCE_CODE,
        source_type: "docx",
        title: HERBACODE_SOURCE_TITLE,
      },
      { onConflict: "source_code" },
    )
    .select("id")
    .single();

  if (error || !source) {
    throw new Error(`Gagal upsert sumber HerbaCode: ${error?.message ?? "data kosong"}`);
  }

  return source.id;
}

async function upsertHealthZones(
  supabase: SupabaseClient<Database>,
  data: HerbaCodeData,
  nowIso: string,
) {
  const rows = data.zones.map((zone) => buildHealthZoneUpsert(zone, nowIso));
  const { data: zones, error } = await supabase
    .from("health_zones")
    .upsert(rows, { onConflict: "zone_code" })
    .select("id, zone_code");

  if (error) {
    throw new Error(`Gagal upsert zona HerbaCode: ${error.message}`);
  }

  return new Map((zones ?? []).map((zone) => [zone.zone_code, zone.id]));
}

async function upsertPlants(
  supabase: SupabaseClient<Database>,
  plans: ImportPlanPlant[],
  existingById: Map<string, PlantRow>,
  nowIso: string,
) {
  const matchedRows = plans
    .filter((plan) => plan.existingMatch)
    .map((plan) =>
      buildPlantUpsert(
        plan,
        existingById.get(plan.existingMatch?.plantId ?? "") ?? null,
        nowIso,
      ),
    );
  const newRows = plans
    .filter((plan) => !plan.existingMatch)
    .map((plan) => buildPlantUpsert(plan, null, nowIso));
  const plantIdsByKey = new Map<string, string>();

  if (matchedRows.length > 0) {
    const { data, error } = await supabase
      .from("plants")
      .upsert(matchedRows, { onConflict: "id" })
      .select("id, slug");

    if (error) {
      throw new Error(`Gagal upsert tanaman HerbaCode existing: ${error.message}`);
    }

    for (const plan of plans.filter((item) => item.existingMatch)) {
      const id = plan.existingMatch?.plantId;

      if (id) {
        plantIdsByKey.set(plan.plant.plantKey, id);
      }
    }

    for (const row of data ?? []) {
      const plan = plans.find(
        (item) => item.existingMatch?.plantId === row.id,
      );

      if (plan) {
        plantIdsByKey.set(plan.plant.plantKey, row.id);
      }
    }
  }

  if (newRows.length > 0) {
    const { data, error } = await supabase
      .from("plants")
      .upsert(newRows, { onConflict: "slug" })
      .select("id, slug");

    if (error) {
      throw new Error(`Gagal upsert tanaman HerbaCode baru: ${error.message}`);
    }

    for (const row of data ?? []) {
      const plan = plans.find((item) => item.plant.slug === row.slug);

      if (plan) {
        plantIdsByKey.set(plan.plant.plantKey, row.id);
      }
    }
  }

  return plantIdsByKey;
}

async function upsertPlantNames(
  supabase: SupabaseClient<Database>,
  plans: ImportPlanPlant[],
  plantIdsByKey: Map<string, string>,
  sourceId: string,
) {
  const rowsByNormalizedName = new Map<string, PlantNameUpsert>();

  for (const plan of plans) {
    const plantId = plantIdsByKey.get(plan.plant.plantKey);

    if (!plantId) {
      continue;
    }

    for (const name of unique([
      plan.plant.localName,
      plan.plant.slug,
      ...plan.plant.aliases,
    ])) {
      const normalizedName = normalizeHerbaCodeName(name);

      if (!normalizedName || rowsByNormalizedName.has(normalizedName)) {
        continue;
      }

      rowsByNormalizedName.set(normalizedName, {
        language_code: "id",
        name,
        name_type:
          normalizedName === normalizeHerbaCodeName(plan.plant.localName)
            ? "preferred_local"
            : "alternate_local",
        normalized_name: normalizedName,
        plant_id: plantId,
        source_id: sourceId,
      });
    }
  }

  const rows = Array.from(rowsByNormalizedName.values());

  if (rows.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("plant_names")
    .upsert(rows, { onConflict: "source_id,normalized_name" });

  if (error) {
    throw new Error(`Gagal upsert alias HerbaCode: ${error.message}`);
  }
}

async function upsertHerbaCodeEntries(input: {
  data: HerbaCodeData;
  plantIdsByKey: Map<string, string>;
  sourceId: string;
  supabase: SupabaseClient<Database>;
  zoneIdsByCode: Map<string, string>;
}) {
  const rows: HerbaCodeEntryUpsert[] = input.data.entries.map((entry) => {
    const plantId = input.plantIdsByKey.get(entry.plantKey);
    const healthZoneId = input.zoneIdsByCode.get(entry.zoneCode);

    if (!plantId || !healthZoneId) {
      throw new Error(`Relasi HerbaCode tidak lengkap untuk ${entry.zoneTitle} / ${entry.localName}`);
    }

    return {
      active_compounds: entry.activeCompounds,
      benefits: entry.benefits,
      content_status: publishedStatus,
      cultivation_techniques: entry.cultivationTechniques,
      entry_order: entry.entryOrder,
      health_zone_id: healthZoneId,
      local_name: entry.localName,
      plant_id: plantId,
      preparation_methods: entry.preparationMethods,
      raw_entry_title: entry.rawEntryTitle,
      raw_zone_title: entry.rawZoneTitle,
      scientific_name: entry.scientificName,
      source_document_name: HERBACODE_SOURCE_TITLE,
      source_id: input.sourceId,
      title_correction_notes: buildCorrectionNotes(entry),
      used_parts: entry.usedParts,
      warnings: entry.warnings,
      zone_code: entry.zoneCode,
      zone_slug: entry.zoneSlug,
      zone_title: entry.zoneTitle,
    };
  });

  const { error } = await input.supabase
    .from("herbacode_plant_zone_entries")
    .upsert(rows, { onConflict: "source_id,health_zone_id,plant_id" });

  if (error) {
    throw new Error(`Gagal upsert relasi HerbaCode: ${error.message}`);
  }
}

export async function importHerbaCode(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean },
) {
  const data = extractHerbaCodeFromDocx();
  const existing = await readExistingPlants(supabase);
  const indexes = buildExistingPlantIndexes(existing.plants, existing.plantNames);
  const plans = buildPlantPlans(data, indexes);
  const summary = buildSummary(data, plans, options.dryRun);

  writeJsonFile(HERBACODE_DATA_PATH, data);

  if (options.dryRun) {
    writeJsonFile(HERBACODE_REPORT_PATH, summary);
    return summary;
  }

  const nowIso = new Date().toISOString();
  const sourceId = await upsertSource(supabase, data);
  const zoneIdsByCode = await upsertHealthZones(supabase, data, nowIso);
  const plantIdsByKey = await upsertPlants(
    supabase,
    plans,
    indexes.plantById,
    nowIso,
  );

  await upsertPlantNames(supabase, plans, plantIdsByKey, sourceId);
  await upsertHerbaCodeEntries({
    data,
    plantIdsByKey,
    sourceId,
    supabase,
    zoneIdsByCode,
  });
  writeJsonFile(HERBACODE_REPORT_PATH, summary);

  return summary;
}

export function extractHerbaCodeOnly() {
  const data = extractHerbaCodeFromDocx();
  const summary = {
    corrections: data.corrections,
    documentEntryCount: data.entries.length,
    sourceCode: HERBACODE_SOURCE_CODE,
    sourceDocumentName: HERBACODE_SOURCE_TITLE,
    uniquePlantsInDocument: data.uniquePlants.length,
    zonesImported: data.zones.length,
  };

  writeJsonFile(HERBACODE_DATA_PATH, data);
  writeJsonFile(HERBACODE_REPORT_PATH, summary);

  return summary;
}
