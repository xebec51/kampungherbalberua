import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import XLSX from "xlsx";
import type { Database } from "../../../src/lib/supabase/database.types.ts";

export const POSTER_SOURCE_CODE = "KHB-POSTER-216-2026";
export const POSTER_WORKBOOK_PATH =
  "data/plant-poster/source/poster-216-tanaman.xlsx";

type PosterZoneRow = {
  "No. Zona": number;
  "Nama Zona (Mentah)": string;
  "Jumlah Entri": number;
  "Nomor Awal": number;
  "Nomor Akhir": number;
  "Sumber Foto": string;
  "Status Editorial": string;
};

type PosterEntryRow = {
  "Nomor Poster": number;
  "No. Zona": number;
  "Nama Zona (Mentah)": string;
  "Nama Tanaman (Mentah)": string;
  "Status Pembacaan": string;
  "Catatan Verifikasi": string;
  "Sumber Foto": string;
};

type PosterUniqueNameRow = {
  "Nama Mentah": string;
  "Jumlah Kemunculan": number;
  "Zona": string;
  "Status Pembacaan": string;
  "Catatan": string;
  "Status Identifikasi": string;
  "Nama Ilmiah (diisi setelah verifikasi)": string;
};

export type PosterWorkbook = {
  entries: PosterEntryRow[];
  uniqueNames: PosterUniqueNameRow[];
  zones: PosterZoneRow[];
};

export type PosterValidationSummary = {
  collectionCount: number;
  duplicatePosterNumbers: number[];
  entryCount: number;
  gap157to166Absent: boolean;
  missingRequiredSheets: string[];
  status: "valid" | "invalid";
  uniqueRawNameCount: number;
  zoneCount: number;
};

type PosterImportSummary = PosterValidationSummary & {
  dryRun: boolean;
  entriesUpserted: number;
  plantNamesUpserted: number;
  plantsCreated: number;
  plantsMatched: number;
  sourceCode: string;
  sourceRowsUpserted: number;
  unresolvedNames: number;
};

const REQUIRED_SHEETS = ["Entri_Poster", "Nama_Unik", "Zona", "Ringkasan"];

export function normalizePlantName(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string) {
  return normalizePlantName(value).replace(/\s+/g, "-");
}

function readSheet<T>(workbook: XLSX.WorkBook, sheetName: string): T[] {
  const sheet = workbook.Sheets[sheetName];

  if (!sheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<T>(sheet, {
    defval: "",
    raw: false,
  });
}

export function readPosterWorkbook(
  workbookPath = POSTER_WORKBOOK_PATH,
): PosterWorkbook {
  const workbook = XLSX.readFile(resolve(process.cwd(), workbookPath));

  return {
    entries: readSheet<PosterEntryRow>(workbook, "Entri_Poster"),
    uniqueNames: readSheet<PosterUniqueNameRow>(workbook, "Nama_Unik"),
    zones: readSheet<PosterZoneRow>(workbook, "Zona"),
  };
}

export function validatePosterWorkbook(
  workbook = readPosterWorkbook(),
): PosterValidationSummary {
  const posterNumbers = workbook.entries.map((entry) =>
    Number(entry["Nomor Poster"]),
  );
  const duplicatePosterNumbers = posterNumbers.filter(
    (number, index) => posterNumbers.indexOf(number) !== index,
  );
  const gapNumbers = Array.from({ length: 10 }, (_, index) => index + 157);
  const missingRequiredSheets = REQUIRED_SHEETS.filter((sheetName) => {
    const workbookFile = XLSX.readFile(
      resolve(process.cwd(), POSTER_WORKBOOK_PATH),
      { bookSheets: true },
    );
    return !workbookFile.SheetNames.includes(sheetName);
  });
  const uniqueRawNames = new Set(
    workbook.entries.map((entry) =>
      normalizePlantName(String(entry["Nama Tanaman (Mentah)"])),
    ),
  );
  const summary: PosterValidationSummary = {
    collectionCount: workbook.zones.length,
    duplicatePosterNumbers: Array.from(new Set(duplicatePosterNumbers)),
    entryCount: workbook.entries.length,
    gap157to166Absent: gapNumbers.every(
      (gapNumber) => !posterNumbers.includes(gapNumber),
    ),
    missingRequiredSheets,
    status: "invalid",
    uniqueRawNameCount: uniqueRawNames.size,
    zoneCount: workbook.zones.length,
  };

  summary.status =
    summary.entryCount === 206 &&
    summary.uniqueRawNameCount === 89 &&
    summary.zoneCount === 20 &&
    summary.collectionCount === 20 &&
    summary.duplicatePosterNumbers.length === 0 &&
    summary.gap157to166Absent &&
    summary.missingRequiredSheets.length === 0
      ? "valid"
      : "invalid";

  return summary;
}

function writeJsonReport(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function getExistingPlantMap(supabase: SupabaseClient<Database>) {
  const { data, error } = await supabase
    .from("plants")
    .select("id, local_name, scientific_name, canonical_local_name");

  if (error) {
    throw new Error(`Gagal membaca tanaman existing: ${error.message}`);
  }

  const map = new Map<string, string>();

  for (const plant of data ?? []) {
    for (const candidate of [
      plant.local_name,
      plant.scientific_name,
      plant.canonical_local_name,
    ]) {
      if (candidate) {
        map.set(normalizePlantName(candidate), plant.id);
      }
    }
  }

  return map;
}

export async function importPosterWorkbook(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean },
) {
  const workbook = readPosterWorkbook();
  const validation = validatePosterWorkbook(workbook);
  const plantMap = await getExistingPlantMap(supabase);
  const matchedNames = new Set<string>();

  for (const uniqueName of workbook.uniqueNames) {
    const normalized = normalizePlantName(String(uniqueName["Nama Mentah"]));

    if (plantMap.has(normalized)) {
      matchedNames.add(normalized);
    }
  }

  const summary: PosterImportSummary = {
    ...validation,
    dryRun: options.dryRun,
    entriesUpserted: options.dryRun ? 0 : workbook.entries.length,
    plantNamesUpserted: options.dryRun ? 0 : workbook.uniqueNames.length,
    plantsCreated: 0,
    plantsMatched: matchedNames.size,
    sourceCode: POSTER_SOURCE_CODE,
    sourceRowsUpserted: options.dryRun ? 0 : 1,
    unresolvedNames: workbook.uniqueNames.length - matchedNames.size,
  };

  if (validation.status !== "valid") {
    writeJsonReport("data/media/reports/import-summary.json", summary);
    throw new Error("Validasi workbook poster gagal");
  }

  if (options.dryRun) {
    writeJsonReport("data/media/reports/import-summary.json", summary);
    return summary;
  }

  const { data: source, error: sourceError } = await supabase
    .from("plant_sources")
    .upsert(
      {
        claimed_total: 216,
        content_status: "draft",
        description:
          "Transkripsi awal poster Peta 216 Tanaman Obat Kampung Herbal Harmony. Jumlah teramati mengikuti entri yang terbaca pada workbook sumber.",
        file_reference: POSTER_WORKBOOK_PATH,
        numbering_notes:
          "Nomor 157-166 tidak tersedia pada sumber workbook dan tidak dibuat.",
        observed_entry_total: 206,
        source_code: POSTER_SOURCE_CODE,
        source_type: "poster_workbook",
        title: "Peta 216 Tanaman Obat Kampung Herbal Harmony",
      },
      { onConflict: "source_code" },
    )
    .select("id")
    .single();

  if (sourceError || !source) {
    throw new Error(
      `Gagal upsert sumber poster: ${sourceError?.message ?? "data kosong"}`,
    );
  }

  const collections = workbook.zones.map((zone) => ({
    collection_number: Number(zone["No. Zona"]),
    content_status: "draft" as const,
    description: String(zone["Status Editorial"] || ""),
    display_order: Number(zone["No. Zona"]),
    public_title: String(zone["Nama Zona (Mentah)"]),
    slug: `zona-${String(zone["No. Zona"]).padStart(2, "0")}-${slugify(
      String(zone["Nama Zona (Mentah)"]),
    )}`,
    source_id: source.id,
    source_title: String(zone["Nama Zona (Mentah)"]),
    validation_status: "data_demonstrasi" as const,
  }));

  const { data: upsertedCollections, error: collectionError } = await supabase
    .from("plant_collections")
    .upsert(collections, { onConflict: "source_id,collection_number" })
    .select("id, collection_number");

  if (collectionError) {
    throw new Error(`Gagal upsert koleksi poster: ${collectionError.message}`);
  }

  const collectionIdByNumber = new Map(
    (upsertedCollections ?? []).map((collection) => [
      collection.collection_number,
      collection.id,
    ]),
  );

  const entries = workbook.entries.map((entry, index) => {
    const normalizedName = normalizePlantName(
      String(entry["Nama Tanaman (Mentah)"]),
    );
    const plantId = plantMap.get(normalizedName) ?? null;
    const collectionId = collectionIdByNumber.get(Number(entry["No. Zona"]));

    if (!collectionId) {
      throw new Error(`Koleksi zona tidak ditemukan untuk entri ${index + 1}`);
    }

    return {
      collection_id: collectionId,
      display_order: index + 1,
      mapping_status: plantId ? "matched" : "unresolved",
      normalized_candidate_name: normalizedName,
      plant_id: plantId,
      poster_number: Number(entry["Nomor Poster"]),
      raw_plant_name: String(entry["Nama Tanaman (Mentah)"]),
      source_id: source.id,
      transcription_notes: String(entry["Catatan Verifikasi"] || ""),
      transcription_status: "transcribed",
    };
  });

  const { error: entryError } = await supabase
    .from("plant_source_entries")
    .upsert(entries, { onConflict: "source_id,poster_number" });

  if (entryError) {
    throw new Error(`Gagal upsert entri poster: ${entryError.message}`);
  }

  const plantNames = workbook.uniqueNames.map((name) => {
    const normalizedName = normalizePlantName(String(name["Nama Mentah"]));

    return {
      language_code: "id",
      name: String(name["Nama Mentah"]),
      name_type: plantMap.has(normalizedName)
        ? ("poster_raw" as const)
        : ("unresolved_common_name" as const),
      normalized_name: normalizedName,
      notes: String(name["Catatan"] || ""),
      plant_id: plantMap.get(normalizedName) ?? null,
      source_id: source.id,
    };
  });

  const { error: nameError } = await supabase
    .from("plant_names")
    .upsert(plantNames, { onConflict: "source_id,normalized_name" });

  if (nameError) {
    throw new Error(`Gagal upsert nama tanaman poster: ${nameError.message}`);
  }

  writeJsonReport("data/media/reports/import-summary.json", summary);
  return summary;
}
