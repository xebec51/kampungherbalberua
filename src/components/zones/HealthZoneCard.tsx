import Link from "next/link";
import type { HealthZone } from "@/types";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getValidationStatusLabel } from "@/lib/formatters";

type HealthZoneCardProps = {
  zone: HealthZone;
};

export function HealthZoneCard({ zone }: HealthZoneCardProps) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-md border border-herbal-green/10 bg-white shadow-sm">
      <SafeImage
        alt={`Foto papan ${zone.streetName} ${zone.zoneName}`}
        className="aspect-[16/10]"
        fallbackLabel={`Placeholder foto papan ${zone.streetName}`}
        fallbackVariant="map"
        imageClassName="transition duration-500 group-hover:scale-[1.03]"
        sizes="(min-width: 1280px) 20rem, (min-width: 768px) 32vw, 86vw"
        src={zone.imagePath}
      />
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
          <StatusBadge tone="brown">
            {getValidationStatusLabel(zone.validationStatus)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 text-lg font-bold text-herbal-ink">
          <Link
            className="hover:text-herbal-green"
            href={`/zona-kesehatan/${zone.slug}`}
          >
            {zone.streetName}
          </Link>
        </h3>
        <p className="mt-1 text-sm font-semibold text-herbal-green">
          {zone.zoneName}
        </p>
        <p className="mt-3 text-sm text-herbal-muted">
          Blok {zone.blockRanges.join(", ")}
        </p>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          {zone.shortDescription}
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-semibold text-herbal-green hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          href={`/zona-kesehatan/${zone.slug}`}
        >
          Lihat detail zona
        </Link>
      </div>
    </article>
  );
}
