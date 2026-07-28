import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { healthZones } from "../../../src/data/health-zones.ts";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import {
  detectImageMime,
  optimizeWebp,
  sha256,
  storageKey,
  uploadNoOverwrite,
} from "./media-files.ts";

type ZoneMigrationSummary = {
  dryRun: boolean;
  duplicateFilesReused: number;
  failures: string[];
  healthZonesUpserted: number;
  mediaAssetsInserted: number;
  originalUploaded: number;
  publicUploaded: number;
  zoneAttachments: number;
  zonesConsidered: number;
};

function writeJson(path: string, data: unknown) {
  const target = resolve(process.cwd(), path);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function localZoneImagePath(imagePath: string) {
  return resolve(process.cwd(), "public", imagePath.replace(/^\//, ""));
}

export async function migrateZoneImages(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean; limit?: number; only?: string },
) {
  const selectedZones = healthZones
    .filter((zone) => zone.imagePath)
    .filter(
      (zone) =>
        !options.only ||
        zone.zoneCode === options.only ||
        zone.slug === options.only,
    )
    .slice(0, options.limit);
  const manifest = selectedZones.map((zone) => ({
    altText: `Foto papan zona ${zone.streetName} ${zone.zoneName}`,
    attribution: "Dokumentasi KKN Kampung Herbal Berua.",
    decision: "approved",
    decisionReason:
      "Foto lokal dokumentasi KKN; metadata EXIF/GPS dibersihkan sebelum upload.",
    entityKey: zone.zoneCode,
    entityType: "health_zone",
    imageRole: "documentation",
    license: null,
    licenseUrl: null,
    localName: zone.streetName,
    sourceFile: zone.imagePath,
    sourcePage: null,
    status: "approved",
  }));
  const summary: ZoneMigrationSummary = {
    dryRun: options.dryRun,
    duplicateFilesReused: 0,
    failures: [],
    healthZonesUpserted: 0,
    mediaAssetsInserted: 0,
    originalUploaded: 0,
    publicUploaded: 0,
    zoneAttachments: 0,
    zonesConsidered: selectedZones.length,
  };

  writeJson("data/media/manifests/zone-images.json", manifest);

  if (options.dryRun) {
    writeJson("data/media/reports/zone-migration-summary.json", summary);
    return summary;
  }

  for (const zone of selectedZones) {
    if (!zone.imagePath) {
      continue;
    }

    const imageBuffer = readFileSync(localZoneImagePath(zone.imagePath));
    detectImageMime(imageBuffer);

    const original = await optimizeWebp(imageBuffer, 2200, 2200);
    const publicVariant = await optimizeWebp(imageBuffer, 1200, 900);
    const checksum = sha256(publicVariant.data);
    const originalPath = storageKey({
      entityKey: zone.zoneCode,
      hash: checksum,
      role: "original",
      scope: "health-zones",
    });
    const publicPath = storageKey({
      entityKey: zone.zoneCode,
      hash: checksum,
      role: "documentation",
      scope: "health-zones",
    });

    const { data: zoneRow, error: zoneError } = await supabase
      .from("health_zones")
      .select("id")
      .eq("zone_code", zone.zoneCode)
      .maybeSingle();

    if (zoneError) {
      summary.failures.push(`${zone.zoneCode}: ${zoneError.message}`);
      continue;
    }

    let healthZoneId = zoneRow?.id ?? null;

    if (!healthZoneId) {
      const { data: upsertedZone, error: upsertZoneError } = await supabase
        .from("health_zones")
        .upsert(
          {
            block_ranges: zone.blockRanges,
            content_status: "published",
            educational_points: zone.educationalPoints,
            featured: zone.featured,
            health_topic: zone.healthTopic,
            healthy_habits: zone.healthyHabits,
            image_path: zone.imagePath,
            important_notes: zone.importantNotes,
            location_notes: zone.locationNotes,
            overview: zone.overview,
            program_name: zone.programName,
            published_at: zone.publishedAt,
            short_description: zone.shortDescription,
            sign_text: zone.signText,
            slug: zone.slug,
            source_notes: zone.sourceNotes,
            street_name: zone.streetName,
            validation_status: "data_demonstrasi",
            validator_name: zone.validatorName,
            zone_code: zone.zoneCode,
            zone_name: zone.zoneName,
          },
          { onConflict: "zone_code" },
        )
        .select("id")
        .single();

      if (upsertZoneError || !upsertedZone) {
        summary.failures.push(
          `${zone.zoneCode}: gagal upsert zona - ${
            upsertZoneError?.message ?? "data kosong"
          }`,
        );
        continue;
      }

      healthZoneId = upsertedZone.id;
      summary.healthZonesUpserted += 1;
    }

    const originalUpload = await uploadNoOverwrite(
      supabase,
      "media-originals",
      originalPath,
      original.data,
    );
    const publicUpload = await uploadNoOverwrite(
      supabase,
      "media-public",
      publicPath,
      publicVariant.data,
    );

    summary.originalUploaded += originalUpload === "uploaded" ? 1 : 0;
    summary.publicUploaded += publicUpload === "uploaded" ? 1 : 0;
    summary.duplicateFilesReused +=
      originalUpload === "reused" || publicUpload === "reused" ? 1 : 0;

    const assetCode = `zone-${zone.zoneCode}-${checksum.slice(0, 10)}`;
    const { data: existing } = await supabase
      .from("media_assets")
      .select("id")
      .eq("checksum_sha256", checksum)
      .maybeSingle();
    let mediaId = existing?.id ?? null;

    if (!mediaId) {
      const { data: media, error: mediaError } = await supabase
        .from("media_assets")
        .insert({
          alt_text: `Foto papan zona ${zone.streetName} ${zone.zoneName}`,
          asset_code: assetCode,
          attribution_text: "Dokumentasi KKN Kampung Herbal Berua.",
          changes_made:
            "Metadata EXIF/GPS dihapus; dikonversi ke WebP; ukuran disesuaikan untuk web.",
          checksum_sha256: checksum,
          content_status: "published",
          file_size_bytes: publicVariant.data.length,
          height: publicVariant.info.height,
          image_type: "documentation",
          media_kind: "image",
          mime_type: "image/webp",
          original_bucket: "media-originals",
          original_path: originalPath,
          privacy_status: "approved",
          public_bucket: "media-public",
          public_path: publicPath,
          rights_status: "approved",
          source_type: "kkn_documentation",
          title: `Foto papan ${zone.streetName}`,
          width: publicVariant.info.width,
        })
        .select("id")
        .single();

      if (mediaError || !media) {
        summary.failures.push(
          `${zone.zoneCode}: ${mediaError?.message ?? "media kosong"}`,
        );
        continue;
      }

      mediaId = media.id;
      summary.mediaAssetsInserted += 1;
    }

    const { error: attachmentError } = await supabase
      .from("health_zone_media")
      .upsert(
        {
          health_zone_id: healthZoneId,
          is_primary: true,
          media_id: mediaId,
          role: "documentation",
          sort_order: 0,
        },
        { onConflict: "health_zone_id,media_id" },
      );

    if (attachmentError) {
      summary.failures.push(`${zone.zoneCode}: ${attachmentError.message}`);
      continue;
    }

    summary.zoneAttachments += 1;
  }

  writeJson("data/media/reports/zone-migration-summary.json", summary);
  return summary;
}
