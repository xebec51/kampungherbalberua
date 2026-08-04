import Link from "next/link";
import type { PosterPlantCatalogItem } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";

type PosterPlantCardProps = {
  plant: PosterPlantCatalogItem;
  priority?: boolean;
  className?: string;
};

function visiblePartCategory(partCategory: PosterPlantCatalogItem["partCategory"]) {
  return partCategory === "Tidak diklasifikasikan" ? null : partCategory;
}

export function PosterPlantCard({
  className,
  plant,
  priority = false,
}: PosterPlantCardProps) {
  const partCategory = visiblePartCategory(plant.partCategory);
  const href = `/tanaman/${plant.linkedPlantSlug ?? plant.slug}`;

  return (
    <PublicCard className={className}>
      <SafeImage
        alt={
          plant.imageIsIllustration
            ? `Visual referensi untuk tanaman ${plant.rawName}`
            : `Foto tanaman ${plant.rawName}`
        }
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Tanaman ${plant.rawName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        priority={priority}
        sizes="(max-width: 639px) 46vw, (max-width: 1023px) 30vw, (max-width: 1279px) 23vw, 230px"
        src={plant.image}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          {partCategory ? (
            <StatusBadge tone="green">{partCategory}</StatusBadge>
          ) : null}
          <StatusBadge tone="brown">
            {plant.collections.length} zona
          </StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={href}
          >
            {plant.rawName}
          </Link>
        </h3>
        {plant.scientificName ? (
          <p className="mt-1 line-clamp-1 text-xs italic text-herbal-muted sm:text-sm">
            {plant.scientificName}
          </p>
        ) : null}
        <span className="flex-1" aria-hidden="true" />
        <PublicCardAction href={href}>
          Lihat detail
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
