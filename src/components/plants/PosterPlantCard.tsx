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
  const image =
    plant.image && !plant.image.startsWith("/images/placeholders/")
      ? plant.image
      : null;
  const href = `/tanaman/${plant.linkedPlantSlug ?? plant.slug}`;

  return (
    <PublicCard className={className}>
      {image ? (
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
          sizes="(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem"
          src={image}
        />
      ) : null}
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          {partCategory ? (
            <StatusBadge tone="green">{partCategory}</StatusBadge>
          ) : null}
          {plant.linkedPlantId ? (
            <StatusBadge tone="neutral">Profil edukasi tersedia</StatusBadge>
          ) : null}
        </div>
        <h3 className={partCategory || plant.linkedPlantId ? "mt-4 line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink" : "line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink"}>
          <Link
            className="transition hover:text-herbal-green"
            href={href}
          >
            {plant.rawName}
          </Link>
        </h3>
        {plant.scientificName ? (
          <p className="mt-1 text-sm italic text-herbal-muted">
            {plant.scientificName}
          </p>
        ) : null}
        <p className="mt-3 text-sm font-semibold leading-6 text-herbal-deep">
          Dikenalkan di {plant.collections.length} zona
          {plant.posterOccurrenceCount > 1
            ? ` melalui ${plant.posterOccurrenceCount} titik katalog`
            : ""}.
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-herbal-muted">
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
