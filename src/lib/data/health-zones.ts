import { cache } from "react";
import { healthZones as localHealthZones } from "@/data/health-zones";
import {
  getHerbaCodeZoneSummaries,
  getLocalHerbaCodeZoneQrTargetBySlug,
} from "@/lib/data/herbacode";
import { mapHealthZoneRowToHealthZone } from "@/lib/data/health-zone-mapper";
import { getPrimaryHealthZoneMediaMap } from "@/lib/data/media";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HealthZone } from "@/types";

export type PublishedHealthZoneQrTarget = {
  qrKey: string;
  slug: string;
  zoneCode: string;
};

async function fetchPublishedHealthZonesFromDatabase(): Promise<HealthZone[] | null> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return null;
  }

  const { data, error } = await client
    .from("health_zones")
    .select("*")
    .eq("content_status", "published")
    .order("featured", { ascending: false })
    .order("zone_code", { ascending: true });

  if (error) {
    return null;
  }

  if (!data || data.length === 0) {
    return null;
  }

  const zones = data.map(mapHealthZoneRowToHealthZone);
  const mediaByZoneId = await getPrimaryHealthZoneMediaMap(
    zones.map((zone) => zone.id),
  );

  return zones.map((zone) => {
    const media = mediaByZoneId.get(zone.id);

    return {
      ...zone,
      imagePath: media?.publicUrl ?? zone.imagePath,
    };
  });
}

const getPublishedHealthZoneSource = cache(async (): Promise<HealthZone[]> => {
  const databaseZones = await fetchPublishedHealthZonesFromDatabase();
  return databaseZones ?? localHealthZones.filter((zone) => zone.contentStatus === "published");
});

export async function getPublishedHealthZones(): Promise<HealthZone[]> {
  return getPublishedHealthZoneSource();
}

export async function getFeaturedHealthZones(limit = 3): Promise<HealthZone[]> {
  const zones = await getPublishedHealthZoneSource();
  return zones.filter((zone) => zone.featured).slice(0, limit);
}

export async function getHealthZoneBySlug(
  slug: string,
): Promise<HealthZone | undefined> {
  const zones = await getPublishedHealthZoneSource();
  return zones.find((zone) => zone.slug === slug && zone.contentStatus === "published");
}

export async function getPublishedHealthZoneDetailBySlug(
  slug: string,
): Promise<HealthZone | undefined> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return undefined;
  }

  const { data, error } = await client
    .from("health_zones")
    .select("*")
    .eq("content_status", "published")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  const zone = mapHealthZoneRowToHealthZone(data);
  const mediaByZoneId = await getPrimaryHealthZoneMediaMap([zone.id]);
  const media = mediaByZoneId.get(zone.id);

  return {
    ...zone,
    imagePath: media?.publicUrl ?? zone.imagePath,
  };
}

export async function getPublishedHealthZoneQrTargetByCode(
  zoneCode: string,
): Promise<PublishedHealthZoneQrTarget | undefined> {
  const client = await createSupabaseServerClient();

  if (!client) {
    return undefined;
  }

  const { data, error } = await client
    .from("health_zones")
    .select("qr_key, slug, zone_code")
    .eq("content_status", "published")
    .eq("zone_code", zoneCode)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    qrKey: data.qr_key,
    slug: data.slug,
    zoneCode: data.zone_code,
  };
}

export async function getPublishedHealthZoneQrTargetByKey(
  qrKey: string,
): Promise<PublishedHealthZoneQrTarget | undefined> {
  const localHerbaCodeZone = getLocalHerbaCodeZoneQrTargetBySlug(qrKey);

  if (localHerbaCodeZone) {
    return localHerbaCodeZone;
  }

  const client = await createSupabaseServerClient();

  if (client) {
    const { data, error } = await client
      .from("health_zones")
      .select("qr_key, slug, zone_code")
      .eq("content_status", "published")
      .eq("qr_key", qrKey)
      .maybeSingle();

    if (!error && data) {
      return {
        qrKey: data.qr_key,
        slug: data.slug,
        zoneCode: data.zone_code,
      };
    }

    const herbaCodeZone = (await getHerbaCodeZoneSummaries()).find(
      (item) => item.slug === qrKey && !/^khb-z[0-9]{2}$/i.test(qrKey),
    );

    return herbaCodeZone
      ? {
          qrKey: herbaCodeZone.slug,
          slug: herbaCodeZone.slug,
          zoneCode: herbaCodeZone.zoneCode,
        }
      : undefined;
  }

  const zone = localHealthZones.find(
    (item) =>
      item.contentStatus === "published" &&
      item.slug === qrKey &&
      !/^khb-z[0-9]{2}$/i.test(qrKey),
  );

  return zone
    ? {
        qrKey: zone.slug,
        slug: zone.slug,
        zoneCode: zone.zoneCode,
      }
    : undefined;
}

export async function getHealthZoneByCode(
  code: string,
): Promise<HealthZone | undefined> {
  const zones = await getPublishedHealthZoneSource();
  return zones.find((zone) => zone.zoneCode === code && zone.contentStatus === "published");
}

export async function getHealthZoneSlugs(): Promise<string[]> {
  const zones = await getPublishedHealthZoneSource();
  return zones.map((zone) => zone.slug);
}

export async function getHealthZoneCodes(): Promise<string[]> {
  const zones = await getPublishedHealthZoneSource();
  return zones.map((zone) => zone.zoneCode);
}
