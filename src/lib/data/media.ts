import { cache } from "react";
import {
  mapMediaAssetRowToPublicMedia,
  type MediaAssetRow,
} from "@/lib/data/media-mapper";
import type { ContentMediaType } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicMediaAsset } from "@/types";

type PlantMediaJoinRow = {
  plant_id: string;
  media_assets: MediaAssetRow | null;
};

type HealthZoneMediaJoinRow = {
  health_zone_id: string;
  media_assets: MediaAssetRow | null;
};

type ContentMediaJoinRow = {
  content_key: string;
  content_type: string;
  label_as_illustration: boolean;
  media_assets: MediaAssetRow | null;
};

const localMediaAttributions: PublicMediaAsset[] = [
  {
    altText: "Tanaman Jahe",
    attributionText: "Josef Schlaghecken, CC BY-SA 4.0, via Wikimedia Commons.",
    caption:
      "Foto tanaman jahe untuk fallback lokal halaman detail tanaman HerbaCode.",
    changesMade: "Metadata EXIF/GPS tidak disajikan; gambar dioptimalkan ke WebP.",
    creatorName: "Josef Schlaghecken",
    height: null,
    id: "local-plant-jahe",
    imageType: "whole_plant",
    licenseCode: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
    publicUrl: "/images/plants/jahe.webp",
    sourcePageUrl:
      "https://commons.wikimedia.org/wiki/File:Ingwer_(Zingiber_officinale)_Freiland_Anbau_Pflanze-2-Josef_Schlaghecken.jpg",
    title: "Tanaman Jahe",
    width: null,
  },
];

const mediaQueryTimeoutMs = 3_000;

async function withMediaTimeout<T>(promise: PromiseLike<T>, fallback: T) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<T>((resolve) => {
    timeoutId = setTimeout(() => resolve(fallback), mediaQueryTimeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise).catch(() => fallback), timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function toMediaMap<T extends { media_assets: MediaAssetRow | null }>(
  rows: T[] | null,
  getKey: (row: T) => string,
) {
  const map = new Map<string, PublicMediaAsset>();

  for (const row of rows ?? []) {
    const media = row.media_assets
      ? mapMediaAssetRowToPublicMedia(row.media_assets)
      : null;

    if (media) {
      map.set(getKey(row), media);
    }
  }

  return map;
}

export const getPrimaryPlantMediaMap = cache(async (plantIds: string[]) => {
  const client = await createSupabaseServerClient();

  if (!client || plantIds.length === 0) {
    return new Map<string, PublicMediaAsset>();
  }

  const { data, error } = await client
    .from("plant_media")
    .select("plant_id, media_assets(*)")
    .in("plant_id", plantIds)
    .eq("is_primary", true)
    .order("sort_order", { ascending: true });

  if (error) {
    return new Map<string, PublicMediaAsset>();
  }

  return toMediaMap(data as PlantMediaJoinRow[] | null, (row) => row.plant_id);
});

export const getPrimaryHealthZoneMediaMap = cache(
  async (healthZoneIds: string[]) => {
    const client = await createSupabaseServerClient();

    if (!client || healthZoneIds.length === 0) {
      return new Map<string, PublicMediaAsset>();
    }

    const { data, error } = await client
      .from("health_zone_media")
      .select("health_zone_id, media_assets(*)")
      .in("health_zone_id", healthZoneIds)
      .eq("is_primary", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return new Map<string, PublicMediaAsset>();
    }

    return toMediaMap(
      data as HealthZoneMediaJoinRow[] | null,
      (row) => row.health_zone_id,
    );
  },
);

export const getContentMediaSlotMap = cache(
  async (contentType: ContentMediaType, contentKeys: string[]) => {
    const client = await createSupabaseServerClient();

    if (!client || contentKeys.length === 0) {
      return new Map<string, PublicMediaAsset>();
    }

    const { data, error } = await client
      .from("content_media_slots")
      .select("content_type, content_key, label_as_illustration, media_assets(*)")
      .eq("content_type", contentType)
      .in("content_key", contentKeys)
      .eq("is_primary", true)
      .order("sort_order", { ascending: true });

    if (error) {
      return new Map<string, PublicMediaAsset>();
    }

    return toMediaMap(
      data as ContentMediaJoinRow[] | null,
      (row) => row.content_key,
    );
  },
);

export const getPublishedMediaAttributions = cache(async () => {
  const client = await createSupabaseServerClient();

  if (!client) {
    return localMediaAttributions;
  }

  const result = await withMediaTimeout(
    client
      .from("media_assets")
      .select("*")
      .eq("content_status", "published")
      .eq("rights_status", "approved")
      .in("privacy_status", ["approved", "not_required"])
      .not("public_path", "is", null)
      .order("title", { ascending: true }),
    null,
  );

  if (!result || result.error) {
    return localMediaAttributions;
  }

  const media = (result.data ?? [])
    .map(mapMediaAssetRowToPublicMedia)
    .filter((media): media is PublicMediaAsset => Boolean(media))
    .filter(
      (media) =>
        !media.publicUrl.startsWith("/images/placeholders/") &&
        !/sementara|placeholder/i.test(`${media.title} ${media.caption ?? ""}`),
    );

  const publicUrls = new Set(media.map((item) => item.publicUrl));

  return [
    ...media,
    ...localMediaAttributions.filter((item) => !publicUrls.has(item.publicUrl)),
  ];
});
