import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import type { Database } from "../../../src/lib/supabase/database.types.ts";
import type { PlantImageManifestItem } from "./research.ts";
import { loadMediaImportEnv } from "./env.ts";

type UploadSummary = {
  downloadedBytes: number;
  duplicateFilesReused: number;
  failures: string[];
  mediaAssetsInserted: number;
  originalUploaded: number;
  plantAttachments: number;
  publicUploaded: number;
  rejected: number;
  retries: number;
};

const WIKIMEDIA_DOWNLOAD_HOSTS = new Set(["upload.wikimedia.org"]);

export function sha256(buffer: Buffer) {
  return createHash("sha256").update(buffer).digest("hex");
}

export function assertWikimediaDownloadUrl(value: string) {
  const url = new URL(value);

  if (url.protocol !== "https:" || !WIKIMEDIA_DOWNLOAD_HOSTS.has(url.hostname)) {
    throw new Error(`Domain download tidak diizinkan: ${url.hostname}`);
  }
}

export function detectImageMime(buffer: Buffer) {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) {
    return "image/jpeg";
  }

  if (
    buffer.subarray(0, 8).equals(
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    )
  ) {
    return "image/png";
  }

  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }

  throw new Error("Magic bytes bukan JPEG, PNG, atau WebP");
}

async function wait(ms: number) {
  await new Promise((resolveWait) => setTimeout(resolveWait, ms));
}

async function downloadImage(url: string) {
  assertWikimediaDownloadUrl(url);
  const env = loadMediaImportEnv();
  let lastStatus = 0;

  for (let attempt = 1; attempt <= 4; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": env.WIKIMEDIA_USER_AGENT,
      },
      signal: AbortSignal.timeout(20000),
    });

    lastStatus = response.status;

    if (response.ok) {
      const contentType = response.headers.get("content-type") ?? "";

      if (!/^image\/(jpeg|png|webp)/i.test(contentType)) {
        throw new Error(`Content-Type gambar ditolak: ${contentType}`);
      }

      const buffer = Buffer.from(await response.arrayBuffer());
      const detectedMime = detectImageMime(buffer);

      return {
        buffer,
        detectedMime,
        retries: attempt - 1,
      };
    }

    if (![429, 500, 502, 503, 504].includes(response.status)) {
      break;
    }

    await wait(attempt * 2500);
  }

  throw new Error(`Download gambar gagal: HTTP ${lastStatus}`);
}

export async function optimizeWebp(
  buffer: Buffer,
  maxWidth: number,
  maxHeight: number,
) {
  return sharp(buffer, { failOn: "warning" })
    .rotate()
    .resize({
      fit: "inside",
      height: maxHeight,
      withoutEnlargement: true,
      width: maxWidth,
    })
    .webp({ quality: 82 })
    .toBuffer({ resolveWithObject: true });
}

export function storageKey(input: {
  entityKey: string;
  hash: string;
  role: string;
  scope: string;
}) {
  const safeEntityKey = input.entityKey
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return `${input.scope}/${safeEntityKey}/${input.role}-${input.hash.slice(
    0,
    12,
  )}.webp`;
}

export async function uploadNoOverwrite(
  supabase: SupabaseClient<Database>,
  bucket: "media-originals" | "media-public",
  path: string,
  buffer: Buffer,
) {
  const { error } = await supabase.storage.from(bucket).upload(path, buffer, {
    cacheControl: "31536000",
    contentType: "image/webp",
    upsert: false,
  });

  if (!error) {
    return "uploaded" as const;
  }

  if (/already exists/i.test(error.message)) {
    return "reused" as const;
  }

  throw new Error(`Upload ${bucket}/${path} gagal: ${error.message}`);
}

function readPlantManifest() {
  const path = resolve(process.cwd(), "data/media/manifests/plant-images.json");

  if (!existsSync(path)) {
    return [] as PlantImageManifestItem[];
  }

  return JSON.parse(readFileSync(path, "utf8")) as PlantImageManifestItem[];
}

function writeSummary(summary: UploadSummary) {
  const target = resolve(process.cwd(), "data/media/reports/upload-summary.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(summary, null, 2)}\n`, "utf8");
}

export async function uploadApprovedPlantImages(
  supabase: SupabaseClient<Database>,
  options: { dryRun: boolean; limit?: number; only?: string },
) {
  const manifest = readPlantManifest()
    .filter((item) => item.decision === "approved")
    .filter(
      (item) =>
        !options.only ||
        item.plantCode === options.only ||
        item.entityKey === options.only,
    )
    .slice(0, options.limit);
  const summary: UploadSummary = {
    downloadedBytes: 0,
    duplicateFilesReused: 0,
    failures: [],
    mediaAssetsInserted: 0,
    originalUploaded: 0,
    plantAttachments: 0,
    publicUploaded: 0,
    rejected: 0,
    retries: 0,
  };

  for (const item of manifest) {
    if (!item.sourceFile || !item.sourcePage || !item.license || !item.licenseUrl) {
      summary.rejected += 1;
      continue;
    }

    let downloaded: Awaited<ReturnType<typeof downloadImage>>;

    try {
      downloaded = await downloadImage(item.sourceFile);
    } catch (error) {
      summary.failures.push(
        `${item.localName}: ${
          error instanceof Error ? error.message : "download gagal"
        }`,
      );
      summary.rejected += 1;
      continue;
    }

    summary.downloadedBytes += downloaded.buffer.length;
    summary.retries += downloaded.retries;

    const original = await optimizeWebp(downloaded.buffer, 2200, 2200);
    const publicVariant = await optimizeWebp(downloaded.buffer, 1200, 900);
    const publicBuffer = publicVariant.data;
    const originalBuffer = original.data;
    const checksum = sha256(publicBuffer);
    const entityKey = item.plantCode ?? item.entityKey;
    const originalPath = storageKey({
      entityKey,
      hash: checksum,
      role: "original",
      scope: "plants",
    });
    const publicPath = storageKey({
      entityKey,
      hash: checksum,
      role: "cover",
      scope: "plants",
    });

    if (publicBuffer.length > 1024 * 1024) {
      summary.rejected += 1;
      continue;
    }

    if (originalBuffer.length > 6 * 1024 * 1024) {
      summary.rejected += 1;
      continue;
    }

    if (options.dryRun) {
      continue;
    }

    const originalUpload = await uploadNoOverwrite(
      supabase,
      "media-originals",
      originalPath,
      originalBuffer,
    );
    const publicUpload = await uploadNoOverwrite(
      supabase,
      "media-public",
      publicPath,
      publicBuffer,
    );

    summary.originalUploaded += originalUpload === "uploaded" ? 1 : 0;
    summary.publicUploaded += publicUpload === "uploaded" ? 1 : 0;
    summary.duplicateFilesReused +=
      originalUpload === "reused" || publicUpload === "reused" ? 1 : 0;

    const assetCode = `media-${checksum.slice(0, 16)}`;
    const { data: existing } = await supabase
      .from("media_assets")
      .select("id")
      .eq("checksum_sha256", checksum)
      .maybeSingle();
    let mediaId = existing?.id ?? null;

    if (!mediaId) {
      const { data: inserted, error: insertError } = await supabase
        .from("media_assets")
        .insert({
          alt_text: item.altText,
          asset_code: assetCode,
          attribution_text: item.attribution,
          changes_made:
            "Metadata EXIF/GPS dihapus; dikonversi ke WebP; ukuran disesuaikan untuk web.",
          checksum_sha256: checksum,
          content_status: "published",
          creator_name: item.creator,
          file_size_bytes: publicBuffer.length,
          height: publicVariant.info.height,
          image_type: "cover",
          license_code: item.license,
          license_url: item.licenseUrl,
          media_kind: "image",
          mime_type: "image/webp",
          original_bucket: "media-originals",
          original_path: originalPath,
          privacy_status: "not_required",
          public_bucket: "media-public",
          public_path: publicPath,
          rights_status: "approved",
          source_file_url: item.sourceFile,
          source_page_url: item.sourcePage,
          source_type: "wikimedia_commons",
          title: `Foto ${item.localName}`,
          width: publicVariant.info.width,
        })
        .select("id")
        .single();

      if (insertError || !inserted) {
        throw new Error(
          `Media asset gagal dibuat: ${insertError?.message ?? "data kosong"}`,
        );
      }

      mediaId = inserted.id;
    }

    if (!mediaId) {
      throw new Error(`Media asset gagal dibuat untuk ${item.localName}`);
    }

    if (!existing) {
      summary.mediaAssetsInserted += 1;
    }

    const { error: attachError } = await supabase.from("plant_media").upsert(
      {
        is_primary: true,
        media_id: mediaId,
        plant_id: item.entityKey,
        role: "cover",
        sort_order: 0,
      },
      { onConflict: "plant_id,media_id" },
    );

    if (attachError) {
      throw new Error(`Attachment tanaman gagal: ${attachError.message}`);
    }

    summary.plantAttachments += 1;
  }

  writeSummary(summary);
  return summary;
}
