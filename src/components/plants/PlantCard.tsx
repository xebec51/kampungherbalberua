import Link from "next/link";
import type { Plant } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";

type PlantCardProps = {
  plant: Plant;
  priority?: boolean;
  className?: string;
};

export function PlantCard({
  className,
  plant,
  priority = false,
}: PlantCardProps) {
  return (
    <PublicCard className={className}>
      <SafeImage
        alt={`Tanaman ${plant.localName}`}
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Tanaman ${plant.localName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        priority={priority}
        sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem"
        src={plant.image}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          <StatusBadge tone="green">{plant.category}</StatusBadge>
          <StatusBadge className="hidden sm:inline-flex" tone="brown">
            Edukasi umum
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
        <p className="mt-1 line-clamp-1 text-xs italic text-herbal-muted sm:text-sm">
          {plant.scientificName}
        </p>
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
          {plant.shortDescription}
        </p>
        <PublicCardAction href={`/tanaman/${plant.slug}`}>
          Buka profil tanaman
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
