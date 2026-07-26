import type { Database } from "@/lib/supabase/database.types";
import type { ContentStatus, HealthZone, ValidationStatus } from "@/types";

export type HealthZoneRow = Database["public"]["Tables"]["health_zones"]["Row"];

const validationStatusLabels: Record<HealthZoneRow["validation_status"], ValidationStatus> = {
  data_demonstrasi: "data-demonstrasi",
  pending: "menunggu-verifikasi",
  rejected: "ditolak",
  verified: "terverifikasi",
};

const contentStatusLabels: Record<HealthZoneRow["content_status"], ContentStatus> = {
  archived: "archived",
  draft: "draft",
  pending_review: "pending-review",
  published: "published",
};

export function mapHealthZoneRowToHealthZone(row: HealthZoneRow): HealthZone {
  return {
    blockRanges: row.block_ranges,
    contentStatus: contentStatusLabels[row.content_status],
    educationalPoints: row.educational_points,
    featured: row.featured,
    healthTopic: row.health_topic,
    healthyHabits: row.healthy_habits,
    id: row.id,
    imagePath: row.image_path,
    importantNotes: row.important_notes,
    locationNotes: row.location_notes,
    overview: row.overview,
    programName: row.program_name,
    publishedAt: row.published_at,
    shortDescription: row.short_description,
    signText: row.sign_text,
    slug: row.slug,
    sourceNotes: row.source_notes,
    streetName: row.street_name,
    validationStatus: validationStatusLabels[row.validation_status],
    validatorName:
      row.validator_name ?? "Menunggu verifikasi tenaga kesehatan",
    zoneCode: row.zone_code,
    zoneName: row.zone_name,
  };
}
