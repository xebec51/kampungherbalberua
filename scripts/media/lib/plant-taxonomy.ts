import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  AMBIGUOUS_POSTER_NAMES,
  PLANT_TAXONOMY_MAPPINGS,
  type PlantTaxonomyMapping,
} from "../../../data/plant-taxonomy/mappings.ts";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import { normalizePlantName, POSTER_SOURCE_CODE } from "./poster.ts";

export const INITIAL_PLANT_DESCRIPTION =
  "Data awal tanaman yang tercantum pada poster Kampung Herbal Harmony. Identitas dan materi edukasi masih dalam proses verifikasi.";

type PlantRow = Database["public"]["Tables"]["plants"]["Row"];
type PlantInsert = Database["public"]["Tables"]["plants"]["Insert"];
type PlantUpdate = Database["public"]["Tables"]["plants"]["Update"];

type SourceEntryRow = Pick<
  Database["public"]["Tables"]["plant_source_entries"]["Row"],
  | "collection_id"
  | "mapping_status"
  | "normalized_candidate_name"
  | "plant_id"
  | "poster_number"
  | "raw_plant_name"
>;

type PlantCollectionRow = Pick<
  Database["public"]["Tables"]["plant_collections"]["Row"],
  "id" | "public_title"
>;

export type UnresolvedPlantReportItem = {
  ambiguityReason: string;
  candidateScientificNames: string[];
  collections: string[];
  identificationStatus: "unresolved" | "disputed";
  mappingStatus: "unresolved";
  normalizedName: string;
  occurrenceCount: number;
  posterNumbers: number[];
  rawName: string;
  researchStatus: "blocked_ambiguous" | "pending_taxonomy_review";
};

type TaxonomySummary = {
  ambiguousNamesHeld: number;
  candidate: number;
  confirmed: number;
  disputed: number;
  draftPlantsAvailable: number;
  draftPlantsCreated: number;
  dryRun: boolean;
  existingPlantsReused: number;
  failures: string[];
  sourceEntriesMapped: number;
  sourceEntriesMappedTotal: number;
  totalRawNames: number;
  unresolved: number;
  unresolvedEntries: number;
};

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

export function isAmbiguousPosterName(rawName: string) {
  const normalized = normalizePlantName(rawName);

  return AMBIGUOUS_POSTER_NAMES.some(
    (name) => normalizePlantName(name) === normalized,
  );
}

function mappingByNormalizedRawName(mappings = PLANT_TAXONOMY_MAPPINGS) {
  const map = new Map<string, PlantTaxonomyMapping>();

  for (const mapping of mappings) {
    for (const rawName of mapping.rawNames) {
      map.set(normalizePlantName(rawName), mapping);
    }
  }

  return map;
}

function candidateScientificNamesFor(rawName: string) {
  const normalized = normalizePlantName(rawName);

  if (normalized === "rosemary" || normalized === "rosmary") {
    return ["Salvia rosmarinus", "Rosmarinus officinalis"];
  }

  if (normalized === "merigold" || normalized === "marigold") {
    return ["Tagetes erecta", "Calendula officinalis"];
  }

  if (normalized === "kunyit putih" || normalized === "temu putih") {
    return ["Curcuma zedoaria", "Curcuma mangga"];
  }

  if (normalized === "daun jambu") {
    return ["Psidium guajava", "Syzygium aqueum", "Syzygium samarangense"];
  }

  if (normalized === "salam") {
    return ["Syzygium polyanthum", "Eugenia polyantha"];
  }

  if (normalized === "eucalyptus" || normalized === "kayu putih") {
    return ["Melaleuca cajuputi", "Eucalyptus globulus"];
  }

  if (normalized === "cincau") {
    return ["Cyclea barbata", "Platostoma palustre", "Mesona chinensis"];
  }

  if (normalized === "garcinia") {
    return ["Garcinia mangostana", "Garcinia gummi-gutta"];
  }

  return [];
}

function ambiguityReasonFor(rawName: string) {
  if (isAmbiguousPosterName(rawName)) {
    return "Nama poster berada dalam daftar ambigu dan belum memiliki bukti konteks Kampung Herbal Harmony yang cukup kuat.";
  }

  return "Belum memiliki mapping taxonomy terverifikasi pada batch ini.";
}

async function readPosterSource(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("plant_sources")
    .select("id")
    .eq("source_code", POSTER_SOURCE_CODE)
    .single();

  if (error || !data) {
    throw new Error(`Sumber poster tidak ditemukan: ${error?.message ?? "data kosong"}`);
  }

  return data.id;
}

async function readPosterEntries(supabase: SupabaseClient<Database>, sourceId: string) {
  const { data: entries, error: entriesError } = await supabase
    .from("plant_source_entries")
    .select(
      "collection_id, mapping_status, normalized_candidate_name, plant_id, poster_number, raw_plant_name",
    )
    .eq("source_id", sourceId)
    .order("poster_number");

  if (entriesError) {
    throw new Error(`Gagal membaca entri poster: ${entriesError.message}`);
  }

  const { data: collections, error: collectionError } = await supabase
    .from("plant_collections")
    .select("id, public_title")
    .eq("source_id", sourceId);

  if (collectionError) {
    throw new Error(`Gagal membaca koleksi poster: ${collectionError.message}`);
  }

  const collectionById = new Map(
    ((collections ?? []) as PlantCollectionRow[]).map((collection) => [
      collection.id,
      collection.public_title,
    ]),
  );

  return {
    collectionById,
    entries: (entries ?? []) as SourceEntryRow[],
  };
}

export function buildUnresolvedPlantReport(
  entries: SourceEntryRow[],
  collectionById: Map<string, string>,
  mappedNames = mappingByNormalizedRawName(),
) {
  const grouped = new Map<string, UnresolvedPlantReportItem>();

  for (const entry of entries) {
    const normalizedName =
      entry.normalized_candidate_name ?? normalizePlantName(entry.raw_plant_name);

    if (entry.plant_id || mappedNames.has(normalizedName)) {
      continue;
    }

    const existing = grouped.get(normalizedName);
    const collection = collectionById.get(entry.collection_id);

    if (existing) {
      existing.occurrenceCount += 1;
      existing.posterNumbers.push(entry.poster_number);

      if (collection && !existing.collections.includes(collection)) {
        existing.collections.push(collection);
      }

      continue;
    }

    grouped.set(normalizedName, {
      ambiguityReason: ambiguityReasonFor(entry.raw_plant_name),
      candidateScientificNames: candidateScientificNamesFor(entry.raw_plant_name),
      collections: collection ? [collection] : [],
      identificationStatus: isAmbiguousPosterName(entry.raw_plant_name)
        ? "disputed"
        : "unresolved",
      mappingStatus: "unresolved",
      normalizedName,
      occurrenceCount: 1,
      posterNumbers: [entry.poster_number],
      rawName: entry.raw_plant_name,
      researchStatus: isAmbiguousPosterName(entry.raw_plant_name)
        ? "blocked_ambiguous"
        : "pending_taxonomy_review",
    });
  }

  return Array.from(grouped.values()).sort((a, b) =>
    a.rawName.localeCompare(b.rawName, "id"),
  );
}

function findReusablePlant(
  plants: PlantRow[],
  mapping: PlantTaxonomyMapping,
) {
  const normalizedScientificName = normalizePlantName(mapping.scientificName);
  const normalizedRawNames = mapping.rawNames.map(normalizePlantName);

  return (
    plants.find(
      (plant) =>
        plant.plant_code === mapping.plantCode ||
        plant.slug === mapping.slug ||
        normalizePlantName(plant.scientific_name ?? "") === normalizedScientificName ||
        normalizedRawNames.includes(normalizePlantName(plant.local_name)),
    ) ?? null
  );
}

function taxonomyFields(mapping: PlantTaxonomyMapping): PlantUpdate {
  return {
    canonical_local_name: mapping.canonicalLocalName,
    category: mapping.category,
    family: mapping.family,
    identification_status: mapping.identificationStatus,
    plant_code: mapping.plantCode,
    scientific_authority: mapping.scientificAuthority,
    scientific_name: mapping.scientificName,
    source_notes: `${mapping.taxonomySource}: ${mapping.sourceUrl}. ${mapping.identificationNotes}`,
    taxonomy_external_id: mapping.taxonomyExternalId,
    taxonomy_source: mapping.taxonomySource,
  };
}

function newPlantPayload(mapping: PlantTaxonomyMapping): PlantInsert {
  return {
    ...taxonomyFields(mapping),
    care_instructions: [],
    category: mapping.category,
    content_status: "draft",
    description: INITIAL_PLANT_DESCRIPTION,
    featured: false,
    image_path: null,
    local_name: mapping.canonicalLocalName,
    location_status: null,
    other_names: mapping.rawNames.filter(
      (rawName) => rawName !== mapping.canonicalLocalName,
    ),
    preparation: [],
    published_at: null,
    short_description: INITIAL_PLANT_DESCRIPTION,
    slug: mapping.slug,
    traditional_uses: [],
    used_parts: [],
    validation_status: "data_demonstrasi",
    validator_id: null,
    validator_name: null,
    warnings: [],
  };
}

async function readPlants(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("plants")
    .select(
      "id, plant_code, slug, local_name, scientific_name, content_status, canonical_local_name, identification_status",
    );

  if (error) {
    throw new Error(`Gagal membaca plants: ${error.message}`);
  }

  return (data ?? []) as PlantRow[];
}

export async function applyPlantTaxonomy(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean; limit?: number },
) {
  const sourceId = await readPosterSource(supabase);
  const { entries, collectionById } = await readPosterEntries(supabase, sourceId);
  const mappings = PLANT_TAXONOMY_MAPPINGS.slice(0, options.limit);
  const mappedNames = mappingByNormalizedRawName(mappings);
  const unresolvedReport = buildUnresolvedPlantReport(
    entries,
    collectionById,
    mappedNames,
  );
  const summary: TaxonomySummary = {
    ambiguousNamesHeld: unresolvedReport.filter(
      (item) => item.researchStatus === "blocked_ambiguous",
    ).length,
    candidate: mappings.filter(
      (mapping) => mapping.identificationStatus === "candidate",
    ).length,
    confirmed: mappings.filter(
      (mapping) => mapping.identificationStatus === "confirmed",
    ).length,
    disputed: unresolvedReport.filter(
      (item) => item.identificationStatus === "disputed",
    ).length,
    draftPlantsAvailable: 0,
    draftPlantsCreated: 0,
    dryRun: options.dryRun,
    existingPlantsReused: 0,
    failures: [],
    sourceEntriesMapped: 0,
    sourceEntriesMappedTotal: 0,
    totalRawNames: new Set(
      entries.map(
        (entry) =>
          entry.normalized_candidate_name ?? normalizePlantName(entry.raw_plant_name),
      ),
    ).size,
    unresolved: unresolvedReport.length,
    unresolvedEntries: unresolvedReport.reduce(
      (total, item) => total + item.occurrenceCount,
      0,
    ),
  };

  if (options.dryRun) {
    writeJson("data/media/reports/unresolved-plants.json", unresolvedReport);
    writeJson("data/media/reports/plant-taxonomy-summary.json", summary);
    return summary;
  }

  let plants = await readPlants(supabase);

  for (const mapping of mappings) {
    const reusablePlant = findReusablePlant(plants, mapping);
    let plantId = reusablePlant?.id ?? null;

    if (reusablePlant) {
      const { error } = await supabase
        .from("plants")
        .update(taxonomyFields(mapping))
        .eq("id", reusablePlant.id);

      if (error) {
        summary.failures.push(`${mapping.canonicalLocalName}: ${error.message}`);
        continue;
      }

      summary.existingPlantsReused += 1;
    } else {
      const { data: inserted, error } = await supabase
        .from("plants")
        .insert(newPlantPayload(mapping))
        .select("id")
        .single();

      if (error || !inserted) {
        summary.failures.push(
          `${mapping.canonicalLocalName}: ${error?.message ?? "data kosong"}`,
        );
        continue;
      }

      plantId = inserted.id;
      summary.draftPlantsCreated += 1;
    }

    if (!plantId) {
      summary.failures.push(`${mapping.canonicalLocalName}: plant id kosong`);
      continue;
    }

    for (const rawName of mapping.rawNames) {
      const normalizedName = normalizePlantName(rawName);
      const { data: mappedEntries, error: updateEntriesError } = await supabase
        .from("plant_source_entries")
        .update({
          mapping_status: "matched",
          normalized_candidate_name: normalizedName,
          plant_id: plantId,
        })
        .eq("source_id", sourceId)
        .eq("normalized_candidate_name", normalizedName)
        .select("poster_number");

      if (updateEntriesError) {
        summary.failures.push(`${rawName}: ${updateEntriesError.message}`);
        continue;
      }

      summary.sourceEntriesMapped += mappedEntries?.length ?? 0;

      const { error: nameError } = await supabase.from("plant_names").upsert(
        {
          language_code: "id",
          name: rawName,
          name_type: "poster_raw",
          normalized_name: normalizedName,
          notes: mapping.identificationNotes,
          plant_id: plantId,
          source_id: sourceId,
        },
        { onConflict: "source_id,normalized_name" },
      );

      if (nameError) {
        summary.failures.push(`${rawName}: ${nameError.message}`);
      }
    }

    plants = await readPlants(supabase);
  }

  const refreshed = await readPosterEntries(supabase, sourceId);
  const refreshedUnresolved = buildUnresolvedPlantReport(
    refreshed.entries,
    refreshed.collectionById,
    new Map(),
  );
  summary.unresolved = refreshedUnresolved.length;
  summary.unresolvedEntries = refreshedUnresolved.reduce(
    (total, item) => total + item.occurrenceCount,
    0,
  );
  summary.ambiguousNamesHeld = refreshedUnresolved.filter(
    (item) => item.researchStatus === "blocked_ambiguous",
  ).length;
  summary.disputed = refreshedUnresolved.filter(
    (item) => item.identificationStatus === "disputed",
  ).length;
  summary.sourceEntriesMappedTotal = refreshed.entries.filter(
    (entry) => Boolean(entry.plant_id),
  ).length;

  const refreshedPlants = await readPlants(supabase);
  summary.confirmed = refreshedPlants.filter(
    (plant) => plant.identification_status === "confirmed",
  ).length;
  summary.candidate = refreshedPlants.filter(
    (plant) => plant.identification_status === "candidate",
  ).length;
  summary.draftPlantsAvailable = refreshedPlants.filter(
    (plant) => plant.content_status === "draft",
  ).length;

  writeJson("data/media/reports/unresolved-plants.json", refreshedUnresolved);
  writeJson("data/media/reports/plant-taxonomy-summary.json", summary);
  return summary;
}
