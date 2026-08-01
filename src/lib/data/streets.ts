import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import localHerbaCodeData from "../../../data/herbacode/herbacode-data.json";
import {
  getStreetZoneMappingByStreetSlug,
  getStreetZoneMappingByZoneSlug,
  STREET_ZONE_MAPPINGS,
} from "@/lib/data/street-zone-mapping";
import {
  getSupabaseConfig,
  supabaseFetchWithTimeout,
} from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export type PublicStreet = {
  id: string;
  qrKey: string;
  slug: string;
  streetName: string;
  description: string | null;
  attributionText: string;
  blockRanges: string[];
  imageAlt: string;
  imagePath: string | null;
  plantCount: number;
  plantEntries: PublicStreetPlantEntry[];
  relatedZones: PublicStreetRelatedZone[];
  sourceNotes: string[];
};

export type PublicStreetPlantEntry = {
  id: string;
  matchStatus: "exact" | "alias" | "scientific" | "manual" | "ambiguous" | "unresolved";
  normalizedName: string;
  notes: string | null;
  plantSlug: string | null;
  rawPlantName: string;
  scientificName: string | null;
  sortOrder: number;
};

export type PublicStreetRelatedZone = {
  slug: string;
  title: string;
};

const streetPhotoAttribution = "Dokumentasi KKN Kampung Herbal Berua, 2026.";
// Daftar tanaman jalan berasal dari entri HerbaCode published pada zona
// kesehatan pasangan (lihat src/lib/data/street-zone-mapping.ts), bukan lagi
// dari koleksi katalog poster. Jalan dan zona tetap entitas serta QR yang
// berbeda -- lihat relatedZones untuk tautan ke halaman zona pasangan.
const streetPlantSourceNote =
  "Daftar tanaman pada jalan ini mengikuti entri HerbaCode yang telah dipublikasikan pada zona kesehatan pasangannya. Jalan dan zona tetap merupakan entitas serta QR yang berbeda.";
const streetQueryTimeoutMs = 3_000;

type LocalHerbaCodeEntry = {
  entryOrder: number;
  localName: string;
  plantSlug: string;
  scientificName: string | null;
  zoneSlug: string;
};

type LocalHerbaCodeData = {
  entries: LocalHerbaCodeEntry[];
};

const localHerbaCode = localHerbaCodeData as LocalHerbaCodeData;

type ThematicStreetSeed = Omit<
  PublicStreet,
  "plantCount" | "plantEntries" | "relatedZones" | "sourceNotes"
>;

export const thematicStreetSeeds: ThematicStreetSeed[] = [
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["E1-10", "H1-5"],
    description:
      "Jalan tematik dengan papan Digestia untuk edukasi pencernaan sehat di Kampung Herbal Harmony.",
    id: "restored-street-digestia",
    imageAlt: "Papan tanaman di Jl. Digestia",
    imagePath: "/images/streets/digestia.jpg",
    qrKey: "digestia",
    slug: "digestia",
    streetName: "Jl. Digestia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["A1-7", "D1-4", "D9-14"],
    description:
      "Jalan tematik dengan papan Respiria untuk edukasi pernapasan sehat di Kampung Herbal Harmony.",
    id: "restored-street-respiria",
    imageAlt: "Papan tanaman di Jl. Respiria",
    imagePath: "/images/streets/respiria.jpg",
    qrKey: "respiria",
    slug: "respiria",
    streetName: "Jl. Respiria",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["H6-10", "J2-4"],
    description:
      "Jalan tematik dengan papan Glycemia untuk edukasi gula darah terkendali di Kampung Herbal Harmony.",
    id: "restored-street-glycemia",
    imageAlt: "Papan tanaman di Jl. Glycemia",
    imagePath: "/images/streets/glycemia.jpg",
    qrKey: "glycemia",
    slug: "glycemia",
    streetName: "Jl. Glycemia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["D5-14", "E1-4", "E13-14"],
    description:
      "Jalan tematik dengan papan Lipidia untuk edukasi lemak sehat di Kampung Herbal Harmony.",
    id: "restored-street-lipidia",
    imageAlt: "Papan tanaman di Jl. Lipidia",
    imagePath: "/images/streets/lipidia.jpg",
    qrKey: "lipidia",
    slug: "lipidia",
    streetName: "Jl. Lipidia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["B1-9", "C1-7"],
    description:
      "Jalan tematik dengan papan Imun untuk edukasi daya tahan tubuh di Kampung Herbal Harmony.",
    id: "restored-street-imun",
    imageAlt: "Papan tanaman di Jl. Imun",
    imagePath: "/images/streets/imun.jpg",
    qrKey: "imun",
    slug: "imun",
    streetName: "Jl. Imun",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["C8-13", "F1-5"],
    description:
      "Jalan tematik dengan papan Hepatia untuk edukasi hati sehat di Kampung Herbal Harmony.",
    id: "restored-street-hepatia",
    imageAlt: "Papan tanaman di Jl. Hepatia",
    imagePath: "/images/streets/hepatia.jpg",
    qrKey: "hepatia",
    slug: "hepatia",
    streetName: "Jl. Hepatia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["F6-9", "G1-3", "G4-5"],
    description:
      "Jalan tematik dengan papan Feminia untuk edukasi wanita sehat alami di Kampung Herbal Harmony.",
    id: "restored-street-feminia",
    imageAlt: "Papan tanaman di Jl. Feminia",
    imagePath: "/images/streets/feminia.jpg",
    qrKey: "feminia",
    slug: "feminia",
    streetName: "Jl. Feminia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["J5-8", "K1-6"],
    description:
      "Jalan tematik dengan papan Vaskulia untuk edukasi jantung dan pembuluh darah sehat di Kampung Herbal Harmony.",
    id: "restored-street-vaskulia",
    imageAlt: "Papan tanaman di Jl. Vaskulia",
    imagePath: "/images/streets/vaskulia.jpg",
    qrKey: "vaskulia",
    slug: "vaskulia",
    streetName: "Jl. Vaskulia",
  },
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["I1-4", "I5-11"],
    description:
      "Jalan tematik dengan papan Pediatria untuk edukasi anak ceria di Kampung Herbal Harmony.",
    id: "restored-street-pediatria",
    imageAlt: "Papan tanaman di Jl. Pediatria",
    imagePath: "/images/streets/pediatria.jpg",
    qrKey: "pediatria",
    slug: "pediatria",
    streetName: "Jl. Pediatria",
  },
];

async function withStreetTimeout<T>(promise: Promise<T | null>) {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timeoutId = setTimeout(() => resolve(null), streetQueryTimeoutMs);
  });

  try {
    return await Promise.race([promise.catch(() => null), timeout]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

export function normalizeDisplayName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getRelatedZonesForStreetSlug(streetSlug: string): PublicStreetRelatedZone[] {
  const mapping = getStreetZoneMappingByStreetSlug(streetSlug);
  return mapping ? [{ slug: mapping.zoneSlug, title: mapping.zoneTitle }] : [];
}

// Local JSON fallback has no publish-workflow status fields at all (this is
// a raw document-extraction snapshot, not gated by content_status /
// validation_status the way the database is), so entries here cannot be
// filtered the same way as fetchStreetPlantEntriesFromDatabase. This only
// activates when the database is unreachable (see withStreetTimeout below);
// the database result is always preferred when available.
export function localStreetPlantEntries(zoneSlug: string): PublicStreetPlantEntry[] {
  return localHerbaCode.entries
    .filter((entry) => entry.zoneSlug === zoneSlug)
    .sort(
      (left, right) =>
        left.entryOrder - right.entryOrder ||
        left.localName.localeCompare(right.localName, "id"),
    )
    .map((entry) => ({
      id: `${zoneSlug}:${entry.plantSlug}`,
      matchStatus: "exact",
      normalizedName: normalizeDisplayName(entry.localName),
      notes:
        "Tanaman ini termasuk dalam entri HerbaCode pada zona kesehatan pasangan jalan ini (data lokal cadangan; status publikasi tidak tersedia pada sumber ini).",
      plantSlug: entry.plantSlug,
      rawPlantName: entry.localName,
      scientificName: entry.scientificName,
      sortOrder: entry.entryOrder,
    } satisfies PublicStreetPlantEntry));
}

async function fetchStreetPlantEntriesFromDatabase(
  zoneSlug: string,
): Promise<PublicStreetPlantEntry[] | null> {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: supabaseFetchWithTimeout,
    },
  });

  const { data, error } = await client
    .from("herbacode_plant_zone_entries")
    .select(
      "id, local_name, scientific_name, entry_order, health_zones!inner(slug, content_status), plants!inner(slug, scientific_name, content_status, validation_status)",
    )
    .eq("health_zones.slug", zoneSlug)
    .eq("health_zones.content_status", "published")
    .eq("content_status", "published")
    .eq("validation_status", "verified")
    .eq("plants.content_status", "published")
    .eq("plants.validation_status", "verified")
    .order("entry_order", { ascending: true })
    .order("local_name", { ascending: true });

  if (error || !data) {
    return null;
  }

  return data.map(
    (row) =>
      ({
        id: row.id,
        matchStatus: "exact",
        normalizedName: normalizeDisplayName(row.local_name),
        notes:
          "Tanaman ini termasuk dalam entri HerbaCode published pada zona kesehatan pasangan jalan ini.",
        plantSlug: row.plants?.slug ?? null,
        rawPlantName: row.local_name,
        scientificName: row.scientific_name ?? row.plants?.scientific_name ?? null,
        sortOrder: row.entry_order,
      }) satisfies PublicStreetPlantEntry,
  );
}

async function getPlantEntriesForZoneSlug(
  zoneSlug: string,
): Promise<PublicStreetPlantEntry[]> {
  const databaseEntries = await withStreetTimeout(
    fetchStreetPlantEntriesFromDatabase(zoneSlug),
  );

  return databaseEntries ?? localStreetPlantEntries(zoneSlug);
}

async function buildPlantEntriesByStreetSlug() {
  const pairs = await Promise.all(
    STREET_ZONE_MAPPINGS.map(
      async (mapping) =>
        [mapping.streetSlug, await getPlantEntriesForZoneSlug(mapping.zoneSlug)] as const,
    ),
  );

  return new Map(pairs);
}

function buildThematicStreetCatalog(
  plantEntriesByStreetSlug: Map<string, PublicStreetPlantEntry[]>,
): PublicStreet[] {
  return thematicStreetSeeds.map((seed) => {
    const plantEntries = plantEntriesByStreetSlug.get(seed.slug) ?? [];

    return {
      ...seed,
      plantCount: plantEntries.length,
      plantEntries,
      relatedZones: getRelatedZonesForStreetSlug(seed.slug),
      sourceNotes: [streetPlantSourceNote],
    } satisfies PublicStreet;
  });
}

async function fetchPublishedStreetsFromDatabase(
  fallbackCatalog: PublicStreet[],
  plantEntriesByStreetSlug: Map<string, PublicStreetPlantEntry[]>,
) {
  const config = getSupabaseConfig();

  if (!config) {
    return null;
  }

  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: supabaseFetchWithTimeout,
    },
  });

  const { data, error } = await client
    .from("streets")
    .select("id, qr_key, slug, street_name, description")
    .eq("content_status", "published")
    .order("street_name", { ascending: true });

  if (error || !data || data.length === 0) {
    return null;
  }

  const fallbackBySlug = new Map(fallbackCatalog.map((street) => [street.slug, street]));

  return data.map((street) => {
    const fallback = fallbackBySlug.get(street.slug);
    const plantEntries = plantEntriesByStreetSlug.get(street.slug) ?? fallback?.plantEntries ?? [];

    return {
      attributionText: fallback?.attributionText ?? "",
      blockRanges: fallback?.blockRanges ?? [],
      description: street.description ?? fallback?.description ?? null,
      id: street.id,
      imageAlt: fallback?.imageAlt ?? `Papan tanaman di ${street.street_name}`,
      imagePath: fallback?.imagePath ?? null,
      plantCount: plantEntries.length,
      plantEntries,
      qrKey: street.qr_key,
      relatedZones: getRelatedZonesForStreetSlug(street.slug),
      slug: street.slug,
      sourceNotes: [streetPlantSourceNote],
      streetName: street.street_name,
    } satisfies PublicStreet;
  });
}

async function fetchPublishedStreetQrTargetFromDatabase(qrKey: string) {
  const config = getSupabaseConfig();

  if (!config) {
    return undefined;
  }

  const client = createClient<Database>(config.url, config.publishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      fetch: supabaseFetchWithTimeout,
    },
  });

  const { data, error } = await client
    .from("streets")
    .select("qr_key, slug, street_name")
    .eq("content_status", "published")
    .eq("qr_key", qrKey)
    .maybeSingle();

  if (error || !data) {
    return undefined;
  }

  return {
    qrKey: data.qr_key,
    slug: data.slug,
    streetName: data.street_name,
  };
}

export const getPublishedStreets = cache(async () => {
  const plantEntriesByStreetSlug = await buildPlantEntriesByStreetSlug();
  const thematicStreetCatalog = buildThematicStreetCatalog(plantEntriesByStreetSlug);
  const databaseStreets = await withStreetTimeout(
    fetchPublishedStreetsFromDatabase(thematicStreetCatalog, plantEntriesByStreetSlug),
  );

  return (databaseStreets ?? thematicStreetCatalog).sort(
    (left, right) =>
      thematicStreetCatalog.findIndex((street) => street.slug === left.slug) -
      thematicStreetCatalog.findIndex((street) => street.slug === right.slug),
  );
});

export async function getPublishedStreetBySlug(slug: string) {
  const streets = await getPublishedStreets();
  return streets.find((street) => street.slug === slug);
}

export async function getPublishedStreetQrTargetByKey(qrKey: string) {
  const fallbackStreet = thematicStreetSeeds.find((street) => street.qrKey === qrKey);

  if (fallbackStreet) {
    return {
      qrKey: fallbackStreet.qrKey,
      slug: fallbackStreet.slug,
      streetName: fallbackStreet.streetName,
    };
  }

  return fetchPublishedStreetQrTargetFromDatabase(qrKey);
}

export async function getPublishedStreetSlugs() {
  const streets = await getPublishedStreets();
  return streets.map((street) => street.slug);
}

export async function getRestoredStreetNamesByHerbaCodeZoneSlug(zoneSlug: string) {
  const mapping = getStreetZoneMappingByZoneSlug(zoneSlug);

  if (!mapping) {
    return [];
  }

  const publishedNames = new Set(
    (await getPublishedStreets()).map((street) => street.streetName),
  );

  return publishedNames.has(mapping.streetName) ? [mapping.streetName] : [];
}
