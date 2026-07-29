import Link from "next/link";
import type { HealthZone } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getValidationStatusLabel } from "@/lib/formatters";

type HealthZoneCardProps = {
  zone: HealthZone;
  priority?: boolean;
};

export function HealthZoneCard({ priority = false, zone }: HealthZoneCardProps) {
  return (
    <PublicCard>
      <SafeImage
        alt={`Foto papan ${zone.streetName} ${zone.zoneName}`}
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={`Placeholder foto papan ${zone.streetName}`}
        fallbackVariant="map"
        imageClassName="object-cover"
        priority={priority}
        sizes="(min-width: 1280px) 20rem, (min-width: 768px) 32vw, 86vw"
        src={zone.imagePath}
      />
      <PublicCardBody>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
          <StatusBadge tone="brown">
            {getValidationStatusLabel(zone.validationStatus)}
          </StatusBadge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink">
          <Link
            className="transition hover:text-herbal-green"
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
        <PublicCardAction href={`/zona-kesehatan/${zone.slug}`}>
          Lihat detail zona
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
