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
};

export function PlantCard({ plant, priority = false }: PlantCardProps) {
  return (
    <PublicCard>
      <SafeImage
        alt={`Tanaman ${plant.localName}`}
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Gambar sementara tanaman ${plant.localName}`}
        fallbackVariant="plant"
        imageClassName="object-cover"
        priority={priority}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        src={plant.image}
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{plant.category}</StatusBadge>
          <StatusBadge tone="brown">Menunggu verifikasi</StatusBadge>
        </div>
        <h3 className="mt-4 text-lg font-bold leading-tight text-herbal-ink">
          <Link
            className="hover:text-herbal-green"
            href={`/tanaman/${plant.slug}`}
          >
            {plant.localName}
          </Link>
        </h3>
        <p className="mt-1 text-sm italic text-herbal-muted">
          {plant.scientificName}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          {plant.shortDescription}
        </p>
        <PublicCardAction href={`/tanaman/${plant.slug}`}>
          Buka profil tanaman
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
