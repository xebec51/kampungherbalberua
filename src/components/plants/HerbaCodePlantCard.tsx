import Link from "next/link";
import type { HerbaCodePlantProfile } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";

type HerbaCodePlantCardProps = {
  plant: HerbaCodePlantProfile;
  priority?: boolean;
  className?: string;
};

export function HerbaCodePlantCard({
  className,
  plant,
  priority = false,
}: HerbaCodePlantCardProps) {
  return (
    <PublicCard className={className}>
      <SafeImage
        alt={`Tanaman ${plant.localName}`}
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Tanaman ${plant.localName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        media={plant.imageMedia}
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem"
        src={plant.image}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusBadge tone="green">HerbaCode</StatusBadge>
          <StatusBadge tone="brown">
            {plant.zoneEntries.length} zona
          </StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={`/tanaman/${plant.slug}`}
          >
            {plant.localName}
          </Link>
        </h3>
        {plant.scientificName ? (
          <p className="mt-1 line-clamp-1 text-xs italic text-herbal-muted sm:text-sm">
            {plant.scientificName}
          </p>
        ) : null}
        {plant.shortDescription ? (
          <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
            {plant.shortDescription}
          </p>
        ) : (
          <span className="flex-1" aria-hidden="true" />
        )}
        <PublicCardAction href={`/tanaman/${plant.slug}`}>
          Buka profil tanaman
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
