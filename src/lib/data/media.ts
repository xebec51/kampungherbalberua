import { cache } from "react";
import {
  mapMediaAssetRowToPublicMedia,
  type MediaAssetRow,
} from "@/lib/data/media-mapper";
import type { ContentMediaType } from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { PublicMediaAsset } from "@/types";

const posterFallbackAttribution: PublicMediaAsset = {
  altText: "Ilustrasi referensi untuk nama tanaman poster",
  attributionText:
    "Ilustrasi placeholder lokal untuk nama tanaman poster yang belum mempunyai media berlisensi di lingkungan ini.",
  caption: "Ilustrasi referensi untuk katalog tanaman poster.",
  changesMade: "Tidak ada perubahan.",
  creatorName: "Kampung Herbal Berua",
  height: null,
  id: "poster-plant-local-placeholder",
  imageType: "illustration",
  licenseCode: "Aset lokal",
  licenseUrl: null,
  publicUrl: "/images/placeholders/plant.svg",
  sourcePageUrl: null,
  title: "Ilustrasi referensi tanaman herbal poster",
  width: null,
};

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
    return [posterFallbackAttribution];
  }

  const { data, error } = await client
    .from("media_assets")
    .select("*")
    .eq("content_status", "published")
    .eq("rights_status", "approved")
    .in("privacy_status", ["approved", "not_required"])
    .not("public_path", "is", null)
    .order("title", { ascending: true });

  if (error) {
    return [posterFallbackAttribution];
  }

  const mediaItems = (data ?? [])
    .map(mapMediaAssetRowToPublicMedia)
    .filter((media): media is PublicMediaAsset => Boolean(media));

  if (
    !mediaItems.some(
      (media) => media.title === posterFallbackAttribution.title,
    )
  ) {
    mediaItems.push(posterFallbackAttribution);
  }

  return mediaItems;
});
