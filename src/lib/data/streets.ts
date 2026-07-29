import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import posterPlantManifest from "../../../data/media/manifests/poster-plant-catalog.json";
import { normalizePosterName } from "@/lib/data/poster-plants";
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
const streetPhotoSourceNote =
  "Foto papan jalan tematik Kampung Herbal Harmony memuat nama jalan, blok, dan tema kesehatan. Daftar tanaman jalan dipasangkan dari koleksi katalog Kampung Herbal berdasarkan tema papan, bukan dari relasi zona HerbaCode atau kode poster.";
const streetQueryTimeoutMs = 3_000;

type ManifestPosterPlant = {
  rawName: string;
  normalizedName: string;
  slug: string;
  posterNumbers: number[];
  collections: string[];
};

type StreetCatalogTheme = {
  matchStatus: "exact" | "manual";
  notes: string;
  catalogCollectionTitle: string;
  signThemeTitle: string;
};

type ThematicStreetSeed = Omit<
  PublicStreet,
  "plantCount" | "plantEntries"
> & {
  catalogTheme: StreetCatalogTheme;
};

const posterPlants = posterPlantManifest as ManifestPosterPlant[];

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

const thematicStreetSeeds: ThematicStreetSeed[] = [
  {
    attributionText: streetPhotoAttribution,
    blockRanges: ["E1-10", "H1-5"],
    description:
      "Jalan tematik dengan papan Digestia untuk edukasi pencernaan sehat di Kampung Herbal Harmony.",
    id: "restored-street-digestia",
    imageAlt: "Papan tanaman di Jl. Digestia",
    imagePath: "/images/streets/digestia.jpg",
    catalogTheme: {
      catalogCollectionTitle: "Zona Pencernaan Sehat",
      matchStatus: "exact",
      notes: "Tema pada papan cocok dengan koleksi poster.",
      signThemeTitle: "Zona Pencernaan Sehat",
    },
    relatedZones: [{ slug: "pencernaan-sehat", title: "Zona Pencernaan Sehat" }],
    qrKey: "digestia",
    slug: "digestia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Pernapasan Lega",
      matchStatus: "manual",
      notes:
        "Papan menulis Zona Pernapasan Sehat; katalog poster memakai Zona Pernapasan Lega.",
      signThemeTitle: "Zona Pernapasan Sehat",
    },
    relatedZones: [],
    qrKey: "respiria",
    slug: "respiria",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Gula Darah Terkendali",
      matchStatus: "exact",
      notes: "Tema pada papan cocok dengan koleksi poster.",
      signThemeTitle: "Zona Gula Darah Terkendali",
    },
    relatedZones: [],
    qrKey: "glycemia",
    slug: "glycemia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Obesitas & Metabolik",
      matchStatus: "manual",
      notes:
        "Papan menulis Zona Lemak Sehat; katalog poster paling dekat adalah Zona Obesitas & Metabolik.",
      signThemeTitle: "Zona Lemak Sehat",
    },
    relatedZones: [],
    qrKey: "lipidia",
    slug: "lipidia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Imunitas Kuat",
      matchStatus: "manual",
      notes:
        "Papan menulis Zona Daya Tahan Tubuh; katalog poster memakai Zona Imunitas Kuat.",
      signThemeTitle: "Zona Daya Tahan Tubuh",
    },
    relatedZones: [{ slug: "imunitas-kuat", title: "Zona Imunitas Kuat" }],
    qrKey: "imun",
    slug: "imun",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Hati Sehat",
      matchStatus: "exact",
      notes: "Tema pada papan cocok dengan koleksi poster.",
      signThemeTitle: "Zona Hati Sehat",
    },
    relatedZones: [{ slug: "hati-sehat", title: "Zona Hati Sehat" }],
    qrKey: "hepatia",
    slug: "hepatia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Kesehatan Perempuan",
      matchStatus: "manual",
      notes:
        "Papan menulis Zona Wanita Sehat Alami; katalog poster memakai Zona Kesehatan Perempuan.",
      signThemeTitle: "Zona Wanita Sehat Alami",
    },
    relatedZones: [
      { slug: "kesehatan-perempuan", title: "Zona Kesehatan Perempuan" },
    ],
    qrKey: "feminia",
    slug: "feminia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Jantung Sehat",
      matchStatus: "manual",
      notes:
        "Papan menulis Zona Jantung & Pembuluh Darah Sehat; katalog poster memakai Zona Jantung Sehat.",
      signThemeTitle: "Zona Jantung & Pembuluh Darah Sehat",
    },
    relatedZones: [{ slug: "jantung-sehat", title: "Zona Jantung Sehat" }],
    qrKey: "vaskulia",
    slug: "vaskulia",
    sourceNotes: [streetPhotoSourceNote],
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
    catalogTheme: {
      catalogCollectionTitle: "Zona Anak Ceria",
      matchStatus: "exact",
      notes: "Tema pada papan cocok dengan koleksi poster.",
      signThemeTitle: "Zona Anak Ceria",
    },
    relatedZones: [],
    qrKey: "pediatria",
    slug: "pediatria",
    sourceNotes: [streetPhotoSourceNote],
    streetName: "Jl. Pediatria",
  },
];

const restoredStreetNamesByHerbaCodeZoneSlug = new Map<string, string[]>([
  ["imunitas-kuat", ["Jl. Imun"]],
  ["pencernaan-sehat", ["Jl. Digestia"]],
  ["hati-sehat", ["Jl. Hepatia"]],
  ["jantung-sehat", ["Jl. Vaskulia"]],
  ["kesehatan-perempuan", ["Jl. Feminia"]],
]);

async function buildThematicStreetCatalog() {
  return thematicStreetSeeds.map((street) => {
    const plantEntries = posterPlants
      .filter((plant) =>
        plant.collections.includes(street.catalogTheme.catalogCollectionTitle),
      )
      .sort((left, right) => left.rawName.localeCompare(right.rawName, "id"))
      .map((plant, index) => {
        const normalizedName = normalizePosterName(plant.rawName);

        return {
          id: `${street.slug}-${normalizedName}`,
          matchStatus: street.catalogTheme.matchStatus,
          normalizedName,
          notes: `${street.catalogTheme.notes} Koleksi sumber ${street.catalogTheme.catalogCollectionTitle}.`,
          plantSlug: plant.slug,
          rawPlantName: plant.rawName,
          scientificName: null,
          sortOrder: index + 1,
        } satisfies PublicStreetPlantEntry;
      });

    return {
      ...street,
      plantCount: plantEntries.length,
      plantEntries,
    } satisfies PublicStreet;
  });
}

async function fetchPublishedStreetsFromDatabase(
  fallbackCatalog: PublicStreet[],
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

    return {
      attributionText: fallback?.attributionText ?? "",
      blockRanges: fallback?.blockRanges ?? [],
      description: street.description ?? fallback?.description ?? null,
      id: street.id,
      imageAlt: fallback?.imageAlt ?? `Papan tanaman di ${street.street_name}`,
      imagePath: fallback?.imagePath ?? null,
      plantCount: fallback?.plantEntries.length ?? 0,
      plantEntries: fallback?.plantEntries ?? [],
      qrKey: street.qr_key,
      relatedZones: fallback?.relatedZones ?? [],
      slug: street.slug,
      sourceNotes: fallback?.sourceNotes ?? [],
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
  const thematicStreetCatalog = await buildThematicStreetCatalog();
  const databaseStreets = await withStreetTimeout(
    fetchPublishedStreetsFromDatabase(thematicStreetCatalog),
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

export async function getRestoredStreetNamesByHerbaCodeZoneSlug(slug: string) {
  const publishedNames = new Set(
    (await getPublishedStreets()).map((street) => street.streetName),
  );

  return (restoredStreetNamesByHerbaCodeZoneSlug.get(slug) ?? []).filter(
    (streetName) => publishedNames.has(streetName),
  );
}
