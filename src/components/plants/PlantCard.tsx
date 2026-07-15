import Link from "next/link";
import type { Plant } from "@/types";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { StatusBadge } from "@/components/ui/StatusBadge";

type PlantCardProps = {
  plant: Plant;
};

export function PlantCard({ plant }: PlantCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
      <ImagePlaceholder
        label={`Ilustrasi placeholder tanaman ${plant.localName}`}
        variant="plant"
      />
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge tone="green">{plant.category}</StatusBadge>
          <StatusBadge tone="brown">Data demonstrasi</StatusBadge>
        </div>
        <h3 className="mt-4 text-xl font-bold text-herbal-ink">
          <Link className="hover:text-herbal-green" href={`/tanaman/${plant.slug}`}>
            {plant.localName}
          </Link>
        </h3>
        <p className="mt-1 text-sm italic text-herbal-muted">
          {plant.scientificName}
        </p>
        <p className="mt-4 flex-1 text-sm leading-6 text-herbal-muted">
          {plant.shortDescription}
        </p>
        <Link
          className="mt-5 inline-flex text-sm font-semibold text-herbal-green hover:underline"
          href={`/tanaman/${plant.slug}`}
        >
          Lihat detail tanaman
        </Link>
      </div>
    </article>
  );
}
