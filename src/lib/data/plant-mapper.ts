import type { Database } from "@/lib/supabase/database.types";
import type { Plant, PlantCategory, ValidationStatus } from "@/types";

type PlantRow = Database["public"]["Tables"]["plants"]["Row"];

const categoryLabels: Record<PlantRow["category"], PlantCategory> = {
  rimpang: "Rimpang",
  daun: "Daun",
  bunga: "Bunga",
  batang: "Batang",
  lainnya: "Lainnya",
};

const validationStatusLabels: Record<PlantRow["validation_status"], ValidationStatus> = {
  data_demonstrasi: "data-demonstrasi",
  pending: "menunggu-verifikasi",
  verified: "terverifikasi",
  rejected: "ditolak",
};

/**
 * Maps a snake_case database plant row to the camelCase Plant type the UI
 * components already use, filling safe defaults for nullable columns and
 * translating database enums to their existing application labels.
 */
export function mapPlantRowToPlant(row: PlantRow): Plant {
  return {
    id: row.id,
    slug: row.slug,
    localName: row.local_name,
    scientificName: row.scientific_name ?? "",
    otherNames: row.other_names,
    category: categoryLabels[row.category],
    shortDescription: row.short_description,
    description: row.description,
    usedParts: row.used_parts,
    traditionalUses: row.traditional_uses,
    preparation: row.preparation,
    careInstructions: row.care_instructions,
    warnings: row.warnings,
    image: row.image_path ?? "/images/placeholders/plant.svg",
    locationStatus: row.location_status ?? "Lokasi tanaman sedang dipetakan.",
    source: row.source_notes ?? "Sumber data belum dicantumkan.",
    validator: row.validator_name ?? "Belum ada catatan pemeriksa.",
    validationStatus: validationStatusLabels[row.validation_status],
    featured: row.featured,
    published: row.content_status === "published",
  };
}
