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
};

export function PosterPlantCard({ plant }: PosterPlantCardProps) {
  return (
    <PublicCard>
      <SafeImage
        alt={
          plant.imageIsIllustration
            ? `Ilustrasi referensi untuk tanaman ${plant.rawName}`
            : `Foto tanaman ${plant.rawName}`
        }
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Ilustrasi placeholder tanaman ${plant.rawName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        src={plant.image}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone={plant.linkedPlantId ? "green" : "brown"}>
            {plant.linkedPlantId ? "Terhubung ke data tanaman" : "Nama dari poster"}
          </StatusBadge>
          {plant.imageIsIllustration ? (
            <StatusBadge tone="brown">Ilustrasi referensi</StatusBadge>
          ) : null}
        </div>
        <h3 className="mt-4 text-lg font-bold leading-tight text-herbal-ink">
          <Link
            className="hover:text-herbal-green"
            href={`/tanaman/${plant.slug}`}
          >
            {plant.rawName}
          </Link>
        </h3>
        {plant.scientificName ? (
          <p className="mt-1 text-sm italic text-herbal-muted">
            {plant.scientificName}
          </p>
        ) : null}
        <p className="mt-3 text-sm leading-6 text-herbal-muted">
          Muncul {plant.posterOccurrenceCount} kali pada poster.
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-herbal-muted">
          Zona: {plant.collections.slice(0, 3).join(", ")}
          {plant.collections.length > 3 ? "..." : ""}
        </p>
        <PublicCardAction href={`/tanaman/${plant.slug}`}>
          Lihat detail tanaman
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
