import { getPublicMediaUrl } from "@/lib/data/media-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AdminMediaListItem = {
  id: string;
  title: string;
  publicUrl: string | null;
  sourceType: string;
  licenseCode: string | null;
  rightsStatus: string;
  privacyStatus: string;
  contentStatus: string;
  checksumSha256: string;
  createdAt: string;
};

export type AdminMediaDetail = AdminMediaListItem & {
  altText: string;
  attributionText: string | null;
  caption: string | null;
  changesMade: string | null;
  creatorName: string | null;
  height: number | null;
  licenseUrl: string | null;
  originalSignedUrl: string | null;
  sourceFileUrl: string | null;
  sourcePageUrl: string | null;
  width: number | null;
};

function mapListItem(row: {
  checksum_sha256: string;
  content_status: string;
  created_at: string;
  id: string;
  license_code: string | null;
  privacy_status: string;
  public_bucket: string | null;
  public_path: string | null;
  rights_status: string;
  source_type: string;
  title: string;
}): AdminMediaListItem {
  return {
    checksumSha256: row.checksum_sha256,
    contentStatus: row.content_status,
    createdAt: row.created_at,
    id: row.id,
    licenseCode: row.license_code,
    privacyStatus: row.privacy_status,
    publicUrl: getPublicMediaUrl(row),
    rightsStatus: row.rights_status,
    sourceType: row.source_type,
    title: row.title,
  };
}

export async function getAdminMediaAssetById(id: string) {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { data: null, error: "Supabase belum dikonfigurasi." };
  }

  const { data, error } = await client
    .from("media_assets")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return { data: null, error: "Media tidak ditemukan." };
  }

  let originalSignedUrl: string | null = null;

  if (data.original_bucket && data.original_path) {
    const signed = await client.storage
      .from(data.original_bucket)
      .createSignedUrl(data.original_path, 60 * 5);
    originalSignedUrl = signed.data?.signedUrl ?? null;
  }

  return {
    data: {
      ...mapListItem(data),
      altText: data.alt_text,
      attributionText: data.attribution_text,
      caption: data.caption,
      changesMade: data.changes_made,
      creatorName: data.creator_name,
      height: data.height,
      licenseUrl: data.license_url,
      originalSignedUrl,
      sourceFileUrl: data.source_file_url,
      sourcePageUrl: data.source_page_url,
      width: data.width,
    } satisfies AdminMediaDetail,
    error: null,
  };
}
