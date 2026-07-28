import { getPublicMediaUrl } from "@/lib/data/media-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus } from "@/lib/supabase/database.types";

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

type MediaQueryOptions = {
  q?: string;
  status?: string;
};

const contentStatuses: readonly ContentStatus[] = [
  "draft",
  "pending_review",
  "published",
  "archived",
];

function isContentStatus(value: string | undefined): value is ContentStatus {
  return Boolean(value && contentStatuses.includes(value as ContentStatus));
}

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

export async function getAdminMediaAssets(options: MediaQueryOptions = {}) {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { data: [], error: "Supabase belum dikonfigurasi." };
  }

  let query = client
    .from("media_assets")
    .select(
      "id,title,public_bucket,public_path,source_type,license_code,rights_status,privacy_status,content_status,checksum_sha256,created_at",
    )
    .order("created_at", { ascending: false })
    .limit(80);

  if (isContentStatus(options.status)) {
    query = query.eq("content_status", options.status);
  }

  if (options.q) {
    const escapedQuery = options.q.replaceAll("%", "\\%");
    query = query.or(
      `title.ilike.%${escapedQuery}%,asset_code.ilike.%${escapedQuery}%,source_type.ilike.%${escapedQuery}%`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return { data: [], error: "Data media belum dapat dimuat." };
  }

  return { data: (data ?? []).map(mapListItem), error: null };
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
