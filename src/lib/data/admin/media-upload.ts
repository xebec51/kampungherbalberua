import {
  detectImageMime,
  optimizeWebp,
  sha256,
  storageKey,
} from "@/lib/media/image-processing";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type MediaUploadTarget = "health_zone" | "plant" | "product";

export type MediaUploadResult =
  | { data: { mediaId: string }; error: null }
  | { data: null; error: string };

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MEDIA_PUBLIC_MAX_BYTES = 1 * 1024 * 1024;
const MEDIA_ORIGINALS_MAX_BYTES = 6 * 1024 * 1024;

const scopeByTarget: Record<MediaUploadTarget, string> = {
  health_zone: "health-zones",
  plant: "plants",
  product: "products",
};

// Uploads an admin-supplied cover photo through the same media_assets +
// {plant,health_zone}_media pipeline the Wikimedia import pipeline
// (scripts/media/lib/media-files.ts) already writes to -- the public plant
// and zone pages read the *primary* media_assets row first, plants/
// health_zones.image_path only as a legacy fallback when no primary media
// exists. Replacing an existing cover only unlinks the old plant_media /
// health_zone_media row; the underlying media_assets row (and file) is
// never deleted, so nothing here can destroy production media.
export async function uploadContentCoverPhoto(input: {
  actorId: string;
  actorName: string | null;
  entityId: string;
  entityLabel: string;
  entitySlug: string;
  file: File;
  target: MediaUploadTarget;
}): Promise<MediaUploadResult> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return { data: null, error: "Supabase belum dikonfigurasi." };
  }

  if (input.file.size === 0) {
    return { data: null, error: "File foto kosong." };
  }

  if (input.file.size > MAX_UPLOAD_BYTES) {
    return {
      data: null,
      error: "Ukuran file terlalu besar. Maksimum 10MB sebelum kompresi.",
    };
  }

  const rawBuffer = Buffer.from(await input.file.arrayBuffer());
  const detectedMime = detectImageMime(rawBuffer);

  if (!detectedMime) {
    return {
      data: null,
      error: "Format file tidak dikenali. Gunakan JPEG, PNG, atau WebP.",
    };
  }

  let original: Awaited<ReturnType<typeof optimizeWebp>>;
  let cover: Awaited<ReturnType<typeof optimizeWebp>>;

  try {
    [original, cover] = await Promise.all([
      optimizeWebp(rawBuffer, 2200, 2200),
      optimizeWebp(rawBuffer, 1200, 900),
    ]);
  } catch {
    return { data: null, error: "Gagal memproses gambar. Pastikan file tidak rusak." };
  }

  const originalBuffer = original.data;
  const coverBuffer = cover.data;

  if (coverBuffer.length > MEDIA_PUBLIC_MAX_BYTES) {
    return {
      data: null,
      error: "Hasil kompresi masih melebihi 1MB. Gunakan foto dengan detail lebih sederhana.",
    };
  }

  if (originalBuffer.length > MEDIA_ORIGINALS_MAX_BYTES) {
    return { data: null, error: "Ukuran gambar asli melebihi batas 6MB setelah diproses." };
  }

  const checksum = sha256(coverBuffer);
  const scope = scopeByTarget[input.target];
  const entityKey = input.entitySlug || input.entityId;
  const originalPath = storageKey({
    entityKey,
    hash: checksum,
    role: "original",
    scope,
  });
  const publicPath = storageKey({
    entityKey,
    hash: checksum,
    role: "cover",
    scope,
  });

  const { data: existingMedia } = await client
    .from("media_assets")
    .select("id, public_bucket, public_path")
    .eq("checksum_sha256", checksum)
    .maybeSingle();

  let mediaId = existingMedia?.id ?? null;

  if (!mediaId) {
    const originalUpload = await client.storage
      .from("media-originals")
      .upload(originalPath, originalBuffer, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });

    if (originalUpload.error && !/already exists/i.test(originalUpload.error.message)) {
      return { data: null, error: `Unggah gagal: ${originalUpload.error.message}` };
    }

    const publicUpload = await client.storage
      .from("media-public")
      .upload(publicPath, coverBuffer, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });

    if (publicUpload.error && !/already exists/i.test(publicUpload.error.message)) {
      return { data: null, error: `Unggah gagal: ${publicUpload.error.message}` };
    }

    const assetCode = `media-${checksum.slice(0, 16)}`;
    const insertPayload: Database["public"]["Tables"]["media_assets"]["Insert"] = {
      alt_text: `Foto ${input.entityLabel}`,
      asset_code: assetCode,
      changes_made: "Diunggah admin; dikonversi ke WebP dan disesuaikan ukurannya untuk web.",
      checksum_sha256: checksum,
      content_status: "published",
      created_by: input.actorId,
      file_size_bytes: coverBuffer.length,
      height: cover.info.height,
      image_type: "cover",
      media_kind: "image",
      mime_type: "image/webp",
      original_bucket: "media-originals",
      original_path: originalPath,
      privacy_status: "not_required",
      public_bucket: "media-public",
      public_path: publicPath,
      rights_status: "approved",
      source_type: "kkn_documentation",
      title: `Foto ${input.entityLabel}`,
      updated_by: input.actorId,
      width: cover.info.width,
    };

    const { data: inserted, error: insertError } = await client
      .from("media_assets")
      .insert(insertPayload)
      .select("id")
      .single();

    if (insertError || !inserted) {
      return {
        data: null,
        error: insertError?.message ?? "Media gagal disimpan.",
      };
    }

    mediaId = inserted.id;
  }

  let linkResult: { message: string } | null;

  if (input.target === "plant") {
    const unlink = await client
      .from("plant_media")
      .delete()
      .eq("plant_id", input.entityId)
      .eq("role", "cover");

    linkResult = unlink.error;

    if (!linkResult) {
      const link = await client.from("plant_media").insert({
        is_primary: true,
        media_id: mediaId as string,
        plant_id: input.entityId,
        role: "cover",
        sort_order: 0,
      });

      linkResult = link.error;
    }
  } else if (input.target === "health_zone") {
    const unlink = await client
      .from("health_zone_media")
      .delete()
      .eq("health_zone_id", input.entityId)
      .eq("role", "cover");

    linkResult = unlink.error;

    if (!linkResult) {
      const link = await client.from("health_zone_media").insert({
        health_zone_id: input.entityId,
        is_primary: true,
        media_id: mediaId as string,
        role: "cover",
        sort_order: 0,
      });

      linkResult = link.error;
    }
  } else {
    const unlink = await client
      .from("content_media_slots")
      .delete()
      .eq("content_type", "product")
      .eq("content_key", input.entityId)
      .eq("role", "cover");

    linkResult = unlink.error;

    if (!linkResult) {
      const link = await client.from("content_media_slots").insert({
        content_key: input.entityId,
        content_type: "product",
        is_primary: true,
        media_id: mediaId as string,
        role: "cover",
        sort_order: 0,
      });

      linkResult = link.error;
    }
  }

  if (linkResult) {
    return { data: null, error: `Gagal menautkan foto: ${linkResult.message}` };
  }

  return { data: { mediaId: mediaId as string }, error: null };
}
