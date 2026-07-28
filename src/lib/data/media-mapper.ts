import type { Database } from "@/lib/supabase/database.types";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { PublicMediaAsset } from "@/types";

export type MediaAssetRow = Database["public"]["Tables"]["media_assets"]["Row"];

export function getPublicMediaUrl(row: Pick<MediaAssetRow, "public_bucket" | "public_path">) {
  const config = getSupabaseConfig();

  if (!config || !row.public_bucket || !row.public_path) {
    return null;
  }

  return `${config.url}/storage/v1/object/public/${row.public_bucket}/${row.public_path}`;
}

export function mapMediaAssetRowToPublicMedia(
  row: MediaAssetRow,
): PublicMediaAsset | null {
  const publicUrl = getPublicMediaUrl(row);

  if (!publicUrl) {
    return null;
  }

  return {
    altText: row.alt_text,
    attributionText: row.attribution_text,
    caption: row.caption,
    changesMade: row.changes_made,
    creatorName: row.creator_name,
    height: row.height,
    id: row.id,
    imageType: row.image_type,
    licenseCode: row.license_code,
    licenseUrl: row.license_url,
    publicUrl,
    sourcePageUrl: row.source_page_url,
    title: row.title,
    width: row.width,
  };
}
