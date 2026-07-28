import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../../src/lib/supabase/database.types.ts";

export type MediaBucketSpec = {
  allowedMimeTypes: string[];
  fileSizeLimit: number;
  id: "media-originals" | "media-public";
  public: boolean;
};

export const MEDIA_BUCKETS: MediaBucketSpec[] = [
  {
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    fileSizeLimit: 6 * 1024 * 1024,
    id: "media-originals",
    public: false,
  },
  {
    allowedMimeTypes: ["image/webp"],
    fileSizeLimit: 1 * 1024 * 1024,
    id: "media-public",
    public: true,
  },
];

type BucketInspection = {
  allowed_mime_types?: string[] | null;
  file_size_limit?: number | string | null;
  id?: string;
  name?: string;
  public?: boolean;
};

function normalizeLimit(value: number | string | null | undefined) {
  if (typeof value === "number") {
    return value;
  }

  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function sameMimeTypes(actual: string[] | null | undefined, expected: string[]) {
  if (!actual) {
    return false;
  }

  return actual.slice().sort().join("|") === expected.slice().sort().join("|");
}

export async function bootstrapMediaBuckets(
  supabase: SupabaseClient<Database>,
) {
  const summary = {
    created: 0,
    verified: 0,
    mismatched: [] as string[],
  };

  for (const spec of MEDIA_BUCKETS) {
    const { data: bucket, error: getError } = await supabase.storage.getBucket(
      spec.id,
    );

    if (getError || !bucket) {
      const { error: createError } = await supabase.storage.createBucket(
        spec.id,
        {
          allowedMimeTypes: spec.allowedMimeTypes,
          fileSizeLimit: spec.fileSizeLimit,
          public: spec.public,
        },
      );

      if (createError) {
        throw new Error(
          `Gagal membuat bucket ${spec.id}: ${createError.message}`,
        );
      }

      summary.created += 1;
      continue;
    }

    const inspected = bucket as BucketInspection;
    const mismatches = [
      inspected.public === spec.public ? null : "public/private",
      sameMimeTypes(inspected.allowed_mime_types, spec.allowedMimeTypes)
        ? null
        : "allowedMimeTypes",
      normalizeLimit(inspected.file_size_limit) === spec.fileSizeLimit
        ? null
        : "fileSizeLimit",
    ].filter(Boolean);

    if (mismatches.length > 0) {
      summary.mismatched.push(`${spec.id}: ${mismatches.join(", ")}`);
      continue;
    }

    summary.verified += 1;
  }

  if (summary.mismatched.length > 0) {
    throw new Error(
      `Konfigurasi bucket berbeda dan tidak diubah otomatis: ${summary.mismatched.join("; ")}`,
    );
  }

  return summary;
}
