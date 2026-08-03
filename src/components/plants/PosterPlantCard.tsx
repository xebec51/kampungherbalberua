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
          {plant.linkedPlantId ? (
            <StatusBadge tone="neutral">Profil edukasi tersedia</StatusBadge>
          ) : null}
        </div>
        <h3 className={partCategory || plant.linkedPlantId ? "mt-3 line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:mt-4 sm:text-lg" : "line-clamp-2 text-sm font-bold leading-tight text-herbal-ink sm:text-lg"}>
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
        <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-herbal-deep sm:mt-3 sm:text-sm sm:leading-6">
          Dikenalkan di {plant.collections.length} zona
          {plant.posterOccurrenceCount > 1
            ? ` melalui ${plant.posterOccurrenceCount} titik katalog`
            : ""}.
        </p>
        <p className="mt-1.5 line-clamp-1 text-xs leading-5 text-herbal-muted sm:mt-2 sm:line-clamp-2 sm:leading-6">
          Zona: {plant.collections.slice(0, 3).join(", ")}
          {plant.collections.length > 3 ? "..." : ""}
        </p>
        <PublicCardAction href={href}>
          Lihat detail
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
