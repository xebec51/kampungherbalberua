import { cache } from "react";
import { peduliGuidance, peduliZones } from "@/data/peduli";

export const getPeduliZones = cache(async () =>
  peduliZones.map((zone) => ({
    ...zone,
    guidance: zone.guidanceSlugs
      .map((slug) => peduliGuidance.find((item) => item.slug === slug))
      .filter((item): item is (typeof peduliGuidance)[number] => Boolean(item)),
  })),
);

export const getPeduliGuidance = cache(async () => peduliGuidance);

export const getPeduliGuidanceBySlug = cache(async (slug: string) =>
  peduliGuidance.find((guidance) => guidance.slug === slug),
);

export const getPeduliGuidanceSlugs = cache(async () =>
  peduliGuidance.map((guidance) => guidance.slug),
);

export const getPeduliZoneById = cache(async (zoneId: string) =>
  peduliZones.find((zone) => zone.id === zoneId),
);
