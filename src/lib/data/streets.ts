import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "@/lib/supabase/config";
import type { Database } from "@/lib/supabase/database.types";

export type PublicStreet = {
  id: string;
  slug: string;
  streetName: string;
  description: string | null;
};

const restoredThematicStreets: PublicStreet[] = [
  {
    description: "Jalan tematik untuk zona pencernaan.",
    id: "restored-street-digestia",
    slug: "digestia",
    streetName: "Jl. Digestia",
  },
  {
    description: "Jalan tematik untuk zona pernapasan.",
    id: "restored-street-respiria",
    slug: "respiria",
    streetName: "Jl. Respiria",
  },
  {
    description: "Jalan tematik untuk zona gula darah.",
    id: "restored-street-glycemia",
    slug: "glycemia",
    streetName: "Jl. Glycemia",
  },
  {
    description: "Jalan tematik untuk zona lemak sehat.",
    id: "restored-street-lipidia",
    slug: "lipidia",
    streetName: "Jl. Lipidia",
  },
  {
    description: "Jalan tematik untuk zona daya tahan tubuh.",
    id: "restored-street-imun",
    slug: "imun",
    streetName: "Jl. Imun",
  },
  {
    description: "Jalan tematik untuk zona hati sehat.",
    id: "restored-street-hepatia",
    slug: "hepatia",
    streetName: "Jl. Hepatia",
  },
  {
    description: "Jalan tematik untuk zona kesehatan perempuan.",
    id: "restored-street-feminia",
    slug: "feminia",
    streetName: "Jl. Feminia",
  },
  {
    description: "Jalan tematik untuk zona jantung dan pembuluh darah.",
    id: "restored-street-vaskulia",
    slug: "vaskulia",
    streetName: "Jl. Vaskulia",
  },
  {
    description: "Jalan tematik untuk zona anak.",
    id: "restored-street-pediatria",
    slug: "pediatria",
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

async function fetchPublishedStreetsFromDatabase() {
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
  });

  const { data, error } = await client
    .from("streets")
    .select("id, slug, street_name, description")
    .eq("content_status", "published")
    .order("street_name", { ascending: true });

  if (error || !data || data.length === 0) {
    return null;
  }

  return data.map((street) => ({
    description: street.description,
    id: street.id,
    slug: street.slug,
    streetName: street.street_name,
  })) satisfies PublicStreet[];
}

export const getPublishedStreets = cache(async () => {
  return (await fetchPublishedStreetsFromDatabase()) ?? restoredThematicStreets;
});

export async function getRestoredStreetNamesByHerbaCodeZoneSlug(slug: string) {
  const publishedNames = new Set(
    (await getPublishedStreets()).map((street) => street.streetName),
  );

  return (restoredStreetNamesByHerbaCodeZoneSlug.get(slug) ?? []).filter(
    (streetName) => publishedNames.has(streetName),
  );
}
