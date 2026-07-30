import Link from "next/link";
import { SafeImage } from "@/components/ui/SafeImage";
import type { HerbaCodePlantProfile, HerbaCodePlantZoneEntry } from "@/types";

type ZonePlantMiniCardProps = {
  entry: HerbaCodePlantZoneEntry;
  plant?: HerbaCodePlantProfile;
  priority?: boolean;
};

export function ZonePlantMiniCard({
  entry,
  plant,
  priority = false,
}: ZonePlantMiniCardProps) {
  const localName = plant?.localName ?? entry.plantLocalName;
  const scientificName = plant?.scientificName ?? entry.plantScientificName;
  const shortDescription = plant?.shortDescription;
  const slug = plant?.slug ?? entry.plantSlug;

  return (
    <Link
      className="group/card grid h-full grid-cols-[6.75rem_1fr] overflow-hidden rounded-[var(--radius-card)] border border-herbal-green/10 bg-white shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-0.5 hover:border-herbal-green/35 hover:shadow-[var(--shadow-lift)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown sm:grid-cols-1"
      data-zone-plant-card
      href={`/tanaman/${slug}`}
    >
      <SafeImage
        alt={`Tanaman ${localName}`}
        className="h-full min-h-[8.25rem] !rounded-none !border-0 !shadow-none sm:aspect-[4/3] sm:min-h-0"
        fallbackLabel={`Tanaman ${localName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        priority={priority}
        sizes="(max-width: 640px) 7rem, (max-width: 1024px) 42vw, 28vw"
        src={plant?.image}
      />
      <span className="flex min-w-0 flex-col p-4">
        <span className="line-clamp-2 text-base font-bold leading-snug text-herbal-ink transition group-hover/card:text-herbal-green">
          {localName}
        </span>
        {scientificName ? (
          <span className="mt-1 line-clamp-1 text-xs italic text-herbal-muted">
            {scientificName}
          </span>
        ) : null}
        {shortDescription ? (
          <span className="mt-3 line-clamp-3 text-sm leading-6 text-herbal-muted">
            {shortDescription}
          </span>
        ) : null}
        <span className="mt-auto pt-4 text-sm font-bold text-herbal-green">
          Lihat tanaman
        </span>
      </span>
    </Link>
  );
}
