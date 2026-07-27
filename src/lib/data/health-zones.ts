import { cache } from "react";
import { healthZones as localHealthZones } from "@/data/health-zones";
import { mapHealthZoneRowToHealthZone } from "@/lib/data/health-zone-mapper";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { HealthZone } from "@/types";

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

  return data.map(mapHealthZoneRowToHealthZone);
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
