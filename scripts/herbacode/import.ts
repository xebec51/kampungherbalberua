import { readFileSync } from "node:fs";
import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentStatus,
  Database,
  PlantCategory,
  ValidationStatus,
} from "../../src/lib/supabase/database.types.ts";
import {
  extractHerbaCodeFromDocx,
  findHerbaCodeDocumentPath,
  HERBACODE_DATA_PATH,
  HERBACODE_SOURCE_CODE,
  HERBACODE_SOURCE_TITLE,
  normalizeHerbaCodeName,
  writeJsonFile,
  type HerbaCodeData,
  type HerbaCodeEntry,
  type HerbaCodePlant,
} from "./extract.ts";

export const HERBACODE_LATEST_REPORT_PATH =
  "data/herbacode/latest-import-report.json";

// The 9 zones that already existed in production before this document (they
// were originally created from an earlier, incomplete HerbaCode document).
// zone_code is a permanent QR identity and must never be re-derived from a
// document's occurrence order -- a differently-ordered/differently-sized
// document would otherwise silently reassign it to the wrong zone. This
// explicit map is the authoritative source for these 9 titles; normalized
// title matching is only used as a fallback for anything outside this list
// (e.g. a zone an admin created independently through the dashboard).
const LEGACY_ZONE_TITLE_TO_CODE: Record<string, string> = {
  [normalizeHerbaCodeName("Zona Imunitas Kuat")]: "khb-z01",
  [normalizeHerbaCodeName("Zona Pencernaan Sehat")]: "khb-z02",
  [normalizeHerbaCodeName("Zona Ginjal Sehat")]: "khb-z03",
  [normalizeHerbaCodeName("Zona Hati Sehat")]: "khb-z04",
  [normalizeHerbaCodeName("Zona Jantung Sehat")]: "khb-z05",
  [normalizeHerbaCodeName("Zona Tulang & Sendi")]: "khb-z06",
  [normalizeHerbaCodeName("Zona Kesehatan Mulut")]: "khb-z07",
  [normalizeHerbaCodeName("Zona Anti Mikroba")]: "khb-z08",
  [normalizeHerbaCodeName("Zona Kesehatan Perempuan")]: "khb-z09",
};

// Manually-vetted equivalences for local-name spelling variants confirmed (by
// direct production data audit, 2026-07-31) to be the SAME real-world plant
// under a different spelling -- not a general fuzzy-matching mechanism.
// "Jinten Hitam" and "Jintan Hitam" both resolved to separate plant rows on
// first import (one from the poster/taxonomy pipeline, one from HerbaCode),
// which the ambiguous-mapping detector correctly flagged; the two rows were
// consolidated (relations moved, alias merged into canonical, duplicate
// archived) and this entry keeps the document's "Jinten Hitam" wording
// pointed at the canonical "Jintan Hitam" plant on every future re-import,
// even if the merged alias were ever removed from other_names. This list
// must stay short and human-reviewed: auto-resolving ambiguity is exactly
// what must NOT happen for genuinely distinct plants like "Kunyit Putih" vs
// "Temu Putih", which stays flagged, never entered here.
// "Rosela" and "Rosella" resolved to separate plant rows for the same reason:
// nine of the ten document occurrences carry the complete scientific name
// "Hibiscus sabdariffa L." and matched the existing "Rosella" plant via the
// scientific-name fallback, but one occurrence (zone khb-z17, entry order 9)
// has an incomplete scientific name ("L." only) in the source document, which
// does not match the scientific-name index and fell through to creating a new
// "Rosela" plant instead (confirmed by direct production data audit,
// 2026-08-01). Both spelling variants below cover every local-name form found
// in the document for this plant, so the alias match now succeeds regardless
// of whether that entry's scientific name is complete -- the root cause,
// not just this one entry.
const KNOWN_LOCAL_NAME_ALIAS_OVERRIDES: Record<string, string> = {
  [normalizeHerbaCodeName("Jinten Hitam")]: normalizeHerbaCodeName("Jintan Hitam"),
  [normalizeHerbaCodeName("Rosela")]: normalizeHerbaCodeName("Rosella"),
  [normalizeHerbaCodeName("Rosela, Bunga rosela")]: normalizeHerbaCodeName("Rosella"),
};

export type PlantRow = Pick<
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

export type HealthZoneRow = Pick<
  Database["public"]["Tables"]["health_zones"]["Row"],
  "id" | "slug" | "zone_code" | "zone_name"
>;

type HerbaCodeEntryRow = Pick<
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Row"],
  "health_zone_id" | "id" | "local_name" | "plant_id" | "zone_code" | "zone_title"
>;

type PlantNameRow = Pick<
  Database["public"]["Tables"]["plant_names"]["Row"],
  "name" | "normalized_name" | "plant_id"
>;

export type ExistingPlantMatch = {
  matchKey: string;
  method: "alias" | "exact" | "scientific";
  plantId: string;
};

export type ImportPlanPlant = {
  entries: HerbaCodeEntry[];
  existingMatch: ExistingPlantMatch | null;
  plant: HerbaCodePlant;
};

export type ZoneResolution = {
  isNew: boolean;
  matchMethod: "legacy" | "new" | "title";
  slug: string;
  title: string;
  zoneCode: string;
  zoneId: string | null;
};

export type HerbaCodeImportReport = {
  countsAfter: {
    entries: number;
    plants: number;
    zones: number;
  };
  countsBefore: {
    entries: number;
    plants: number;
    zones: number;
  };
  documentPath: string | null;
  documentSha256: string | null;
  dryRun: boolean;
  mapping: {
    alias: Array<{ localName: string; matchKey: string }>;
    ambiguous: Array<{ localNames: string[]; normalizedScientificName: string }>;
    exact: Array<{ localName: string; matchKey: string }>;
    new: Array<{ localName: string; scientificName: string | null; slug: string }>;
    scientific: Array<{ localName: string; matchKey: string }>;
    unresolved: Array<{ localName: string; reason: string }>;
  };
  plants: {
    newCount: number;
    retainedNotInDocument: Array<{
      localName: string;
      plantId: string;
      slug: string;
    }>;
    updatedCount: number;
  };
  relations: {
    createdCount: number;
    retainedNotInDocument: Array<{
      plantLocalName: string;
      zoneCode: string;
      zoneTitle: string;
    }>;
    updatedCount: number;
  };
  streetZoneRelationChanges: {
    changed: boolean;
    reason: string;
  };
  titleCorrections: HerbaCodeData["corrections"];
  zones: {
    newlyAssigned: Array<{ displayOrder: number; title: string; zoneCode: string }>;
    renamed: Array<{ newTitle: string; oldTitle: string; zoneCode: string }>;
    retained: Array<{ displayOrder: number; title: string; zoneCode: string }>;
  };
};

type PlantUpsert = Database["public"]["Tables"]["plants"]["Insert"];
type PlantUpdate = Database["public"]["Tables"]["plants"]["Update"];
type HealthZoneUpsert = Database["public"]["Tables"]["health_zones"]["Insert"];
type HealthZoneUpdate = Database["public"]["Tables"]["health_zones"]["Update"];
type HerbaCodeEntryInsert =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Insert"];
type HerbaCodeEntryUpdate =
  Database["public"]["Tables"]["herbacode_plant_zone_entries"]["Update"];
type PlantNameUpsert = Database["public"]["Tables"]["plant_names"]["Insert"];

// New rows created by this importer are never auto-published and never carry
// a fabricated validator: content_status starts as draft and validation as
// pending, exactly like a human-created draft would. An admin must review and
// publish through the dashboard, which is the only place validator_name /
// source_notes / validation_checked_at get supplied by a real person.
const draftStatus: ContentStatus = "draft";
const pendingValidationStatus: ValidationStatus = "pending";

function readStoredHerbaCodeData(): HerbaCodeData {
  return JSON.parse(readFileSync(HERBACODE_DATA_PATH, "utf8")) as HerbaCodeData;
}

function loadHerbaCodeData(documentPath?: string): HerbaCodeData {
  if (documentPath) {
    return extractHerbaCodeFromDocx(documentPath);
  }

  const resolvedPath = findHerbaCodeDocumentPath();
  return resolvedPath ? extractHerbaCodeFromDocx(resolvedPath) : readStoredHerbaCodeData();
}

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

export function buildExistingPlantIndexes(
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

export function findExistingPlantMatch(
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
    const overrideTarget = KNOWN_LOCAL_NAME_ALIAS_OVERRIDES[normalized];
    const plantId = indexes.aliases.get(overrideTarget ?? normalized);

    if (plantId) {
      return {
        matchKey: candidate,
        method:
          !overrideTarget && normalized === normalizeHerbaCodeName(plant.localName)
            ? "exact"
            : "alias",
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

// Only ever used for plants with NO existing match -- a genuine new row, so
// there is nothing to preserve. Existing plants are never touched by this
// column set (care_instructions / preparation / traditional_uses / warnings
// are curated by admins through the dashboard, not owned by this importer).
function buildNewPlantInsert(plan: ImportPlanPlant): PlantUpsert {
  const entries = plan.entries;
  const aliases = unique(plan.plant.aliases).filter(
    (alias) =>
      normalizeHerbaCodeName(alias) !== normalizeHerbaCodeName(plan.plant.localName),
  );

  return {
    canonical_local_name: plan.plant.localName,
    category: categoryFromUsedParts(entries),
    care_instructions: [],
    content_status: draftStatus,
    description: buildPlantDescription(plan.plant),
    featured: false,
    identification_status: "candidate",
    image_path: null,
    location_status: null,
    local_name: plan.plant.localName,
    other_names: aliases,
    plant_code: `herbacode-${plan.plant.slug}`,
    preparation: [],
    scientific_name: plan.plant.scientificName,
    short_description: buildPlantDescription(plan.plant),
    slug: plan.plant.slug,
    source_notes: buildSourceNotes(),
    traditional_uses: [],
    used_parts: mergeTextArrays(...entries.map((entry) => entry.usedParts)),
    validation_status: pendingValidationStatus,
    warnings: [],
  } satisfies PlantUpsert;
}

// Only touches fields this importer actually owns for an EXISTING plant:
// aliases (merged, never removed) and used_parts (merged, never removed).
// Never touches content_status / validation_status / validator_* / featured /
// image_path / care_instructions / preparation / traditional_uses / warnings
// / description -- those belong to the admin dashboard (or, for
// taxonomy-owned columns, the separate taxonomy importer).
function buildExistingPlantUpdate(
  plan: ImportPlanPlant,
  existing: PlantRow,
): PlantUpdate | null {
  const mergedAliases = unique([
    ...existing.other_names,
    ...plan.plant.aliases,
  ]).filter(
    (alias) =>
      normalizeHerbaCodeName(alias) !== normalizeHerbaCodeName(existing.local_name),
  );
  const mergedUsedParts = mergeTextArrays(
    ...plan.entries.map((entry) => entry.usedParts),
  );
  const aliasesChanged =
    mergedAliases.length !== existing.other_names.length ||
    mergedAliases.some((alias) => !existing.other_names.includes(alias));

  if (!aliasesChanged) {
    return null;
  }

  return {
    other_names: mergedAliases,
    used_parts: mergedUsedParts.length > 0 ? mergedUsedParts : undefined,
  };
}

function buildNewHealthZoneInsert(
  zone: HerbaCodeData["zones"][number],
  resolution: ZoneResolution,
): HealthZoneUpsert {
  return {
    block_ranges: [],
    content_status: draftStatus,
    display_order: zone.displayOrder,
    educational_points: [],
    featured: false,
    health_topic: zone.title,
    healthy_habits: [],
    image_path: null,
    important_notes: [],
    location_notes: null,
    overview: zone.title,
    program_name: "Kampung Herbal Harmony",
    short_description: zone.title,
    sign_text: zone.title,
    slug: resolution.slug,
    source_notes: [HERBACODE_SOURCE_TITLE],
    // Street relations are never derived from zone names/titles -- streets
    // and zones are separate entities (see docs/zona-kesehatan.md). This
    // document contains no street data, so street_name stays untouched.
    street_name: null,
    validation_status: pendingValidationStatus,
    zone_code: resolution.zoneCode,
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
    .select(
      "id, slug, local_name, canonical_local_name, scientific_name, other_names, category, image_path, featured, identification_status, plant_code",
    );

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

async function readExistingHealthZones(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("health_zones")
    .select("id, slug, zone_code, zone_name");

  if (error) {
    throw new Error(`Gagal membaca zona existing: ${error.message}`);
  }

  return (data ?? []) as HealthZoneRow[];
}

async function readExistingHerbaCodeEntries(
  supabase: SupabaseClient<Database>,
  sourceId: string,
) {
  const { data, error } = await supabase
    .from("herbacode_plant_zone_entries")
    .select(
      "id, health_zone_id, plant_id, zone_code, zone_title, local_name",
    )
    .eq("source_id", sourceId);

  if (error) {
    throw new Error(`Gagal membaca relasi HerbaCode existing: ${error.message}`);
  }

  return (data ?? []) as HerbaCodeEntryRow[];
}

// Resolves each extracted zone's permanent zone_code. The 9 known legacy
// titles always resolve through the explicit map (so their code is stable
// even against an empty local database); anything else matches an existing
// zone by normalized title if one exists, otherwise gets the next unused
// khb-zNN code in document order. New codes always start after the highest
// legacy code (khb-z09) regardless of what already exists in the database, so
// a fresh local reset and a long-lived production database assign identical
// codes to the 11 new zones (khb-z10..khb-z20 for this document).
export function resolveZones(
  zones: HerbaCodeData["zones"],
  existingZones: HealthZoneRow[],
): Map<string, ZoneResolution> {
  const byNormalizedTitle = new Map(
    existingZones.map((zone) => [normalizeHerbaCodeName(zone.zone_name), zone]),
  );
  const byZoneCode = new Map(existingZones.map((zone) => [zone.zone_code, zone]));
  const legacyCodes = new Set(Object.values(LEGACY_ZONE_TITLE_TO_CODE));
  const legacyMaxNumber = Math.max(
    0,
    ...Array.from(legacyCodes).map((code) => Number.parseInt(code.slice("khb-z".length), 10)),
  );
  const existingMaxNumber = existingZones.reduce((max, zone) => {
    const match = zone.zone_code.match(/^khb-z(\d+)$/);
    return match ? Math.max(max, Number.parseInt(match[1]!, 10)) : max;
  }, 0);

  let nextNewNumber = Math.max(legacyMaxNumber, existingMaxNumber);
  const resolutions = new Map<string, ZoneResolution>();
  // The 9 legacy codes are permanently reserved for their own titles from the
  // start, regardless of processing order -- this prevents an unrelated
  // existing row (e.g. differently-seeded local/demo data, or a zone an admin
  // created independently) whose title happens to normalize-match a NEW
  // document zone from "stealing" a code that belongs to a different title.
  const claimedCodes = new Set(legacyCodes);
  const sortedZones = [...zones].sort((left, right) => left.displayOrder - right.displayOrder);

  for (const zone of sortedZones) {
    const normalizedTitle = normalizeHerbaCodeName(zone.title);
    const legacyCode = LEGACY_ZONE_TITLE_TO_CODE[normalizedTitle];

    if (legacyCode) {
      const existing = byZoneCode.get(legacyCode);
      resolutions.set(zone.slug, {
        isNew: !existing,
        matchMethod: "legacy",
        slug: existing?.slug ?? zone.slug,
        title: zone.title,
        zoneCode: legacyCode,
        zoneId: existing?.id ?? null,
      });
      continue;
    }

    const titleMatch = byNormalizedTitle.get(normalizedTitle);

    if (titleMatch && !claimedCodes.has(titleMatch.zone_code)) {
      claimedCodes.add(titleMatch.zone_code);
      resolutions.set(zone.slug, {
        isNew: false,
        matchMethod: "title",
        slug: titleMatch.slug,
        title: zone.title,
        zoneCode: titleMatch.zone_code,
        zoneId: titleMatch.id,
      });
      continue;
    }

    let newCode: string;
    do {
      nextNewNumber += 1;
      newCode = `khb-z${String(nextNewNumber).padStart(2, "0")}`;
    } while (claimedCodes.has(newCode));

    claimedCodes.add(newCode);
    resolutions.set(zone.slug, {
      isNew: true,
      matchMethod: "new",
      slug: zone.slug,
      title: zone.title,
      zoneCode: newCode,
      zoneId: null,
    });
  }

  return resolutions;
}

// data/herbacode/herbacode-data.json is committed and doubles as a live public
// fallback (src/lib/data/herbacode.ts reads it whenever Supabase is
// unreachable/empty, including for the legacy /z/[code] QR redirect). Its
// zoneCode fields must therefore carry the real, permanent, resolved codes --
// never the raw doc-occurrence placeholder extract.ts assigns internally --
// or the fallback path would redirect old printed QR codes to the wrong zone.
export function applyResolvedZoneCodes(
  data: HerbaCodeData,
  zoneResolutions: Map<string, ZoneResolution>,
): HerbaCodeData {
  const resolvedCodeBySlug = new Map(
    Array.from(zoneResolutions.entries()).map(([slug, resolution]) => [
      slug,
      resolution.zoneCode,
    ]),
  );

  return {
    ...data,
    entries: data.entries.map((entry) => ({
      ...entry,
      zoneCode: resolvedCodeBySlug.get(entry.zoneSlug) ?? entry.zoneCode,
    })),
    zones: data.zones.map((zone) => ({
      ...zone,
      zoneCode: resolvedCodeBySlug.get(zone.slug) ?? zone.zoneCode,
    })),
  };
}

// Groups plants by normalized scientific name using each plan's FINAL resolved
// identity (the existing plant it matched, or its own new-plant identity if
// unmatched). A group spanning more than one distinct final identity is
// ambiguous -- e.g. "Kunyit Putih" and "Temu Putih" both independently match
// their own existing plant rows (never merged), yet share a near-identical
// scientific name. This must never auto-merge them; it only flags the pair
// for manual review. This is distinct from a plant like "Daun Katuk" that
// fails alias matching but resolves via scientific name to the SAME existing
// "Katuk" row as "Katuk" itself -- both share one final identity, so that
// case is a successful cross-vernacular match, not an ambiguity.
export function buildAmbiguousScientificNameGroups(plans: ImportPlanPlant[]) {
  const groups = new Map<string, Map<string, string>>();

  for (const plan of plans) {
    // A handful of entries in the source document have an incomplete
    // scientific name -- just a bare taxonomic authority abbreviation (e.g.
    // "Nama ilmiah: L.") with no genus/species at all. Grouping on that would
    // fabricate ambiguity between otherwise unrelated plants (three different
    // species all showing "L." as their entire "scientific name"). A real
    // binomial name always has at least two tokens (genus + species), so
    // anything shorter is excluded here rather than treated as a match --
    // this is a source-document data gap to flag for manual review, not
    // grounds to group plants together.
    if (
      !plan.plant.scientificName ||
      normalizeHerbaCodeName(plan.plant.scientificName).split(" ").filter(Boolean).length < 2
    ) {
      continue;
    }

    const key = normalizeHerbaCodeName(plan.plant.scientificName);
    const identity = plan.existingMatch
      ? `existing:${plan.existingMatch.plantId}`
      : `new:${plan.plant.plantKey}`;

    if (!groups.has(key)) {
      groups.set(key, new Map());
    }

    if (!groups.get(key)!.has(identity)) {
      groups.get(key)!.set(identity, plan.plant.localName);
    }
  }

  const ambiguous: HerbaCodeImportReport["mapping"]["ambiguous"] = [];

  for (const [normalizedScientificName, identities] of groups) {
    if (identities.size > 1) {
      ambiguous.push({
        localNames: Array.from(identities.values()),
        normalizedScientificName,
      });
    }
  }

  return ambiguous;
}

function buildMapping(plans: ImportPlanPlant[]): HerbaCodeImportReport["mapping"] {
  const exact: HerbaCodeImportReport["mapping"]["exact"] = [];
  const alias: HerbaCodeImportReport["mapping"]["alias"] = [];
  const scientific: HerbaCodeImportReport["mapping"]["scientific"] = [];
  const unresolved: HerbaCodeImportReport["mapping"]["unresolved"] = [];
  const newPlants: HerbaCodeImportReport["mapping"]["new"] = [];

  for (const plan of plans) {
    if (!plan.existingMatch) {
      newPlants.push({
        localName: plan.plant.localName,
        scientificName: plan.plant.scientificName,
        slug: plan.plant.slug,
      });
      continue;
    }

    const entry = { localName: plan.plant.localName, matchKey: plan.existingMatch.matchKey };

    if (plan.existingMatch.method === "exact") exact.push(entry);
    else if (plan.existingMatch.method === "alias") alias.push(entry);
    else scientific.push(entry);
  }

  return {
    alias,
    ambiguous: buildAmbiguousScientificNameGroups(plans),
    exact,
    new: newPlants,
    scientific,
    unresolved,
  };
}

async function upsertSource(
  supabase: SupabaseClient<Database>,
  data: HerbaCodeData,
  documentPath: string | null,
) {
  const { data: source, error } = await supabase
    .from("plant_sources")
    .upsert(
      {
        claimed_total: data.entries.length,
        content_status: "published",
        description:
          "Konten HerbaCode dari dokumen sumber untuk zona kesehatan dan relasi tanaman-zona Kampung Herbal Harmony.",
        file_reference: documentPath ?? "data/herbacode/herbacode-data.json",
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
  zoneResolutions: Map<string, ZoneResolution>,
) {
  const zoneIdBySlug = new Map<string, string>();
  const newRows: HealthZoneUpsert[] = [];
  const updateJobs: Array<{ resolution: ZoneResolution; update: HealthZoneUpdate }> = [];

  for (const zone of data.zones) {
    const resolution = zoneResolutions.get(zone.slug);

    if (!resolution) {
      throw new Error(`Zona tidak dapat diresolusi: ${zone.title}`);
    }

    if (resolution.isNew) {
      newRows.push(buildNewHealthZoneInsert(zone, resolution));
      continue;
    }

    // Existing zone: only ever touch zone_name/health_topic/short_description/
    // overview/sign_text (content sourced from the document) and
    // display_order (public listing order). content_status,
    // validation_status, validator_*, featured, image_path, location_notes,
    // and street_name are left untouched -- those are either admin-curated or
    // (for street_name) explicitly out of scope for this importer.
    updateJobs.push({
      resolution,
      update: {
        display_order: zone.displayOrder,
        health_topic: zone.title,
        overview: zone.title,
        sign_text: zone.title,
        short_description: zone.title,
        zone_name: zone.title,
      },
    });
  }

  if (newRows.length > 0) {
    const { data: inserted, error } = await supabase
      .from("health_zones")
      .insert(newRows)
      .select("id, slug, zone_code");

    if (error) {
      throw new Error(`Gagal membuat zona HerbaCode baru: ${error.message}`);
    }

    for (const row of inserted ?? []) {
      zoneIdBySlug.set(row.slug, row.id);
    }
  }

  for (const job of updateJobs) {
    if (!job.resolution.zoneId) {
      throw new Error(`Zona existing tanpa id: ${job.resolution.title}`);
    }

    const { error } = await supabase
      .from("health_zones")
      .update(job.update)
      .eq("id", job.resolution.zoneId);

    if (error) {
      throw new Error(`Gagal memperbarui zona ${job.resolution.title}: ${error.message}`);
    }

    zoneIdBySlug.set(job.resolution.slug, job.resolution.zoneId);
  }

  return zoneIdBySlug;
}

async function upsertPlants(
  supabase: SupabaseClient<Database>,
  plans: ImportPlanPlant[],
  existingPlantById: Map<string, PlantRow>,
) {
  const plantIdsByKey = new Map<string, string>();
  const newRows: Array<{ plan: ImportPlanPlant; row: PlantUpsert }> = [];
  const updateJobs: Array<{ id: string; plan: ImportPlanPlant; update: PlantUpdate }> = [];

  for (const plan of plans) {
    if (!plan.existingMatch) {
      newRows.push({ plan, row: buildNewPlantInsert(plan) });
      continue;
    }

    plantIdsByKey.set(plan.plant.plantKey, plan.existingMatch.plantId);
    const existing = existingPlantById.get(plan.existingMatch.plantId);

    if (existing) {
      const update = buildExistingPlantUpdate(plan, existing);

      if (update) {
        updateJobs.push({ id: existing.id, plan, update });
      }
    }
  }

  if (newRows.length > 0) {
    // Genuinely new plants only -- insert(), never upsert-by-slug. Upserting
    // on a natural key here would silently overwrite an unrelated existing
    // row's curated content (care_instructions, description, etc.) if its
    // slug ever happened to collide, which alias/scientific-name matching
    // failed to catch. A real collision should fail loudly instead.
    const { data, error } = await supabase
      .from("plants")
      .insert(newRows.map((item) => item.row))
      .select("id, slug");

    if (error) {
      throw new Error(`Gagal membuat tanaman HerbaCode baru: ${error.message}`);
    }

    const idBySlug = new Map((data ?? []).map((row) => [row.slug, row.id]));

    for (const item of newRows) {
      const id = idBySlug.get(item.row.slug!);

      if (id) {
        plantIdsByKey.set(item.plan.plant.plantKey, id);
      }
    }
  }

  for (const job of updateJobs) {
    const { error } = await supabase.from("plants").update(job.update).eq("id", job.id);

    if (error) {
      throw new Error(
        `Gagal memperbarui tanaman ${job.plan.plant.localName}: ${error.message}`,
      );
    }
  }

  return { newCount: newRows.length, plantIdsByKey, updatedCount: updateJobs.length };
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
  existingEntries: HerbaCodeEntryRow[];
  plantIdsByKey: Map<string, string>;
  sourceId: string;
  supabase: SupabaseClient<Database>;
  zoneIdBySlug: Map<string, string>;
  zoneResolutions: Map<string, ZoneResolution>;
}) {
  const existingByHealthZoneAndPlant = new Map(
    input.existingEntries.map((entry) => [`${entry.health_zone_id}:${entry.plant_id}`, entry]),
  );
  const newRows: HerbaCodeEntryInsert[] = [];
  const updateJobs: Array<{ id: string; update: HerbaCodeEntryUpdate }> = [];
  const touchedKeys = new Set<string>();

  for (const entry of input.data.entries) {
    const plantId = input.plantIdsByKey.get(entry.plantKey);
    const resolution = input.zoneResolutions.get(entry.zoneSlug);
    const healthZoneId = resolution ? input.zoneIdBySlug.get(resolution.slug) : undefined;

    if (!plantId || !resolution || !healthZoneId) {
      throw new Error(`Relasi HerbaCode tidak lengkap untuk ${entry.zoneTitle} / ${entry.localName}`);
    }

    const key = `${healthZoneId}:${plantId}`;
    touchedKeys.add(key);
    const existing = existingByHealthZoneAndPlant.get(key);
    const sharedFields = {
      active_compounds: entry.activeCompounds,
      benefits: entry.benefits,
      cultivation_techniques: entry.cultivationTechniques,
      entry_order: entry.entryOrder,
      local_name: entry.localName,
      preparation_methods: entry.preparationMethods,
      raw_entry_title: entry.rawEntryTitle,
      raw_zone_title: entry.rawZoneTitle,
      scientific_name: entry.scientificName,
      source_document_name: HERBACODE_SOURCE_TITLE,
      title_correction_notes: buildCorrectionNotes(entry),
      used_parts: entry.usedParts,
      warnings: entry.warnings,
      zone_code: resolution.zoneCode,
      zone_slug: resolution.slug,
      zone_title: entry.zoneTitle,
    };

    if (existing) {
      // Preserve workflow/validation state -- re-importing document content
      // must never silently re-publish an entry an admin archived, or
      // invent verification metadata.
      updateJobs.push({ id: existing.id, update: sharedFields });
      continue;
    }

    newRows.push({
      ...sharedFields,
      content_status: draftStatus,
      health_zone_id: healthZoneId,
      plant_id: plantId,
      source_id: input.sourceId,
      validation_status: pendingValidationStatus,
    });
  }

  if (newRows.length > 0) {
    const { error } = await input.supabase
      .from("herbacode_plant_zone_entries")
      .insert(newRows);

    if (error) {
      throw new Error(`Gagal membuat relasi HerbaCode baru: ${error.message}`);
    }
  }

  for (const job of updateJobs) {
    const { error } = await input.supabase
      .from("herbacode_plant_zone_entries")
      .update(job.update)
      .eq("id", job.id);

    if (error) {
      throw new Error(`Gagal memperbarui relasi HerbaCode: ${error.message}`);
    }
  }

  const retainedNotInDocument = input.existingEntries
    .filter((entry) => !touchedKeys.has(`${entry.health_zone_id}:${entry.plant_id}`))
    .map((entry) => ({
      plantLocalName: entry.local_name,
      zoneCode: entry.zone_code,
      zoneTitle: entry.zone_title,
    }));

  return {
    createdCount: newRows.length,
    retainedNotInDocument,
    updatedCount: updateJobs.length,
  };
}

function buildZoneReport(
  data: HerbaCodeData,
  zoneResolutions: Map<string, ZoneResolution>,
): HerbaCodeImportReport["zones"] {
  const retained: HerbaCodeImportReport["zones"]["retained"] = [];
  const newlyAssigned: HerbaCodeImportReport["zones"]["newlyAssigned"] = [];

  for (const zone of data.zones) {
    const resolution = zoneResolutions.get(zone.slug);

    if (!resolution) {
      continue;
    }

    const entry = {
      displayOrder: zone.displayOrder,
      title: zone.title,
      zoneCode: resolution.zoneCode,
    };

    if (resolution.isNew) {
      newlyAssigned.push(entry);
    } else {
      retained.push(entry);
    }
  }

  return {
    newlyAssigned,
    // This document's zone titles are used verbatim for every matched zone
    // (confirmed by title-based resolution above) -- nothing is renamed.
    renamed: [],
    retained,
  };
}

function buildRetainedPlantsNotInDocument(
  plans: ImportPlanPlant[],
  existingPlants: PlantRow[],
  existingEntries: HerbaCodeEntryRow[],
): HerbaCodeImportReport["plants"]["retainedNotInDocument"] {
  const touchedPlantIds = new Set(
    plans
      .map((plan) => plan.existingMatch?.plantId)
      .filter((id): id is string => Boolean(id)),
  );
  const plantIdsWithExistingEntries = new Set(
    existingEntries.map((entry) => entry.plant_id),
  );

  return existingPlants
    .filter(
      (plant) =>
        plantIdsWithExistingEntries.has(plant.id) && !touchedPlantIds.has(plant.id),
    )
    .map((plant) => ({
      localName: plant.local_name,
      plantId: plant.id,
      slug: plant.slug,
    }));
}

export async function importHerbaCode(
  supabase: SupabaseClient<Database>,
  options: { documentPath?: string; dryRun: boolean },
): Promise<HerbaCodeImportReport> {
  const resolvedDocumentPath = options.documentPath ?? findHerbaCodeDocumentPath();
  const data = loadHerbaCodeData(options.documentPath);
  const existing = await readExistingPlants(supabase);
  const existingZones = await readExistingHealthZones(supabase);
  const indexes = buildExistingPlantIndexes(existing.plants, existing.plantNames);
  const plans = buildPlantPlans(data, indexes);
  const zoneResolutions = resolveZones(data.zones, existingZones);

  // The source row always exists (or is created) so existing entries can be
  // read even during a dry run -- this is how retainedNotInDocument and
  // update-vs-create counts stay accurate without mutating anything else.
  const sourceId = options.dryRun
    ? (
        await supabase
          .from("plant_sources")
          .select("id")
          .eq("source_code", HERBACODE_SOURCE_CODE)
          .maybeSingle()
      ).data?.id ?? null
    : await upsertSource(supabase, data, resolvedDocumentPath);
  const existingEntries = sourceId
    ? await readExistingHerbaCodeEntries(supabase, sourceId)
    : [];

  writeJsonFile(HERBACODE_DATA_PATH, applyResolvedZoneCodes(data, zoneResolutions));

  const plantsBeforeCount = new Set(existingEntries.map((entry) => entry.plant_id)).size;
  const zonesBeforeCount = existingZones.length;
  const entriesBeforeCount = existingEntries.length;

  if (options.dryRun) {
    const newPlantCount = plans.filter((plan) => !plan.existingMatch).length;
    // Mirrors upsertPlants' real logic: a matched plant only counts as
    // "updated" if buildExistingPlantUpdate would actually produce a write
    // (new aliases introduced), not just because it matched.
    const updatedPlantCount = plans.filter((plan) => {
      if (!plan.existingMatch) {
        return false;
      }
      const existingPlant = indexes.plantById.get(plan.existingMatch.plantId);
      return existingPlant ? buildExistingPlantUpdate(plan, existingPlant) !== null : false;
    }).length;
    // Uses real existing ids throughout (never a name-based heuristic), so the
    // dry-run created/updated estimate is computed the same way the real
    // execution path resolves entries -- only difference is nothing is written.
    const plantIdByDocPlantKey = new Map(
      plans
        .filter((item): item is ImportPlanPlant & { existingMatch: ExistingPlantMatch } =>
          Boolean(item.existingMatch),
        )
        .map((item) => [item.plant.plantKey, item.existingMatch.plantId]),
    );
    const existingEntryPairKeys = new Set(
      existingEntries.map((entry) => `${entry.health_zone_id}:${entry.plant_id}`),
    );
    const touchedExistingPairKeys = new Set<string>();
    let createdCount = 0;
    let updatedCount = 0;

    for (const entry of data.entries) {
      const resolution = zoneResolutions.get(entry.zoneSlug);
      const existingZoneId = resolution?.zoneId ?? null;
      const existingPlantId = plantIdByDocPlantKey.get(entry.plantKey) ?? null;
      const pairKey =
        existingZoneId && existingPlantId ? `${existingZoneId}:${existingPlantId}` : null;

      if (pairKey && existingEntryPairKeys.has(pairKey)) {
        touchedExistingPairKeys.add(pairKey);
        updatedCount += 1;
      } else {
        createdCount += 1;
      }
    }

    const report: HerbaCodeImportReport = {
      countsAfter: {
        entries: data.entries.length,
        plants: data.uniquePlants.length,
        zones: data.zones.length,
      },
      countsBefore: {
        entries: entriesBeforeCount,
        plants: plantsBeforeCount,
        zones: zonesBeforeCount,
      },
      documentPath: resolvedDocumentPath,
      documentSha256: data.documentSha256,
      dryRun: true,
      mapping: buildMapping(plans),
      plants: {
        newCount: newPlantCount,
        retainedNotInDocument: buildRetainedPlantsNotInDocument(
          plans,
          existing.plants,
          existingEntries,
        ),
        updatedCount: updatedPlantCount,
      },
      relations: {
        createdCount,
        retainedNotInDocument: existingEntries
          .filter(
            (entry) =>
              !touchedExistingPairKeys.has(`${entry.health_zone_id}:${entry.plant_id}`),
          )
          .map((entry) => ({
            plantLocalName: entry.local_name,
            zoneCode: entry.zone_code,
            zoneTitle: entry.zone_title,
          })),
        updatedCount,
      },
      streetZoneRelationChanges: {
        changed: false,
        reason:
          "Dokumen sumber tidak memuat data jalan. Relasi zona-jalan (streets, health_zone_streets) tidak disentuh oleh import ini.",
      },
      titleCorrections: data.corrections,
      zones: buildZoneReport(data, zoneResolutions),
    };

    writeJsonFile(HERBACODE_LATEST_REPORT_PATH, report);
    return report;
  }

  const zoneIdBySlug = await upsertHealthZones(supabase, data, zoneResolutions);
  const { newCount, plantIdsByKey, updatedCount } = await upsertPlants(
    supabase,
    plans,
    indexes.plantById,
  );

  await upsertPlantNames(supabase, plans, plantIdsByKey, sourceId as string);
  const relationsResult = await upsertHerbaCodeEntries({
    data,
    existingEntries,
    plantIdsByKey,
    sourceId: sourceId as string,
    supabase,
    zoneIdBySlug,
    zoneResolutions,
  });

  const report: HerbaCodeImportReport = {
    countsAfter: {
      entries: data.entries.length,
      plants: data.uniquePlants.length,
      zones: data.zones.length,
    },
    countsBefore: {
      entries: entriesBeforeCount,
      plants: plantsBeforeCount,
      zones: zonesBeforeCount,
    },
    documentPath: resolvedDocumentPath,
    documentSha256: data.documentSha256,
    dryRun: false,
    mapping: buildMapping(plans),
    plants: {
      newCount,
      retainedNotInDocument: buildRetainedPlantsNotInDocument(
        plans,
        existing.plants,
        existingEntries,
      ),
      updatedCount,
    },
    relations: relationsResult,
    streetZoneRelationChanges: {
      changed: false,
      reason:
        "Dokumen sumber tidak memuat data jalan. Relasi zona-jalan (streets, health_zone_streets) tidak disentuh oleh import ini.",
    },
    titleCorrections: data.corrections,
    zones: buildZoneReport(data, zoneResolutions),
  };

  writeJsonFile(HERBACODE_LATEST_REPORT_PATH, report);
  return report;
}

export function extractHerbaCodeOnly(documentPath?: string) {
  const data = loadHerbaCodeData(documentPath);
  const summary = {
    corrections: data.corrections,
    documentEntryCount: data.entries.length,
    documentSha256: data.documentSha256,
    sourceCode: HERBACODE_SOURCE_CODE,
    sourceDocumentName: HERBACODE_SOURCE_TITLE,
    uniquePlantsInDocument: data.uniquePlants.length,
    zonesImported: data.zones.length,
  };

  // No database connection here (extract-only, no --execute/dry-run against
  // Supabase), so this can only apply the static legacy-title map, not check
  // for admin-created zones. That still guarantees the 9 known legacy titles
  // get their real permanent codes instead of a raw doc-occurrence
  // placeholder in the persisted fallback JSON.
  const zoneResolutions = resolveZones(data.zones, []);
  writeJsonFile(HERBACODE_DATA_PATH, applyResolvedZoneCodes(data, zoneResolutions));

  return summary;
}
