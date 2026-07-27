import Link from "next/link";
import type { Plant } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

type PlantCardProps = {
  plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
  return (
    <PublicCard>
      <ImagePlaceholder
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        label={`Ilustrasi placeholder tanaman ${plant.localName}`}
        variant="plant"
      />
      <PublicCardBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{plant.category}</StatusBadge>
          <StatusBadge tone="brown">Data demonstrasi</StatusBadge>
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
          Lihat detail tanaman
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
