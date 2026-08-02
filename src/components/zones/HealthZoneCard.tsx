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
      {zone.imagePath ? (
        <SafeImage
          alt={`Foto papan ${zone.zoneName}`}
          className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
          fallbackLabel={`Foto papan ${zone.zoneName}`}
          fallbackVariant="map"
          imageClassName="object-cover"
          priority={priority}
          sizes="(min-width: 1280px) 20rem, (min-width: 768px) 32vw, 86vw"
          src={zone.imagePath}
        />
      ) : null}
      <PublicCardBody>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="brown">
            {getValidationStatusLabel(zone.validationStatus)}
          </StatusBadge>
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-extrabold leading-tight text-herbal-ink sm:mt-4 sm:text-lg">
          <Link
            className="transition hover:text-herbal-green"
            href={`/zona-kesehatan/${zone.slug}`}
          >
            {zone.zoneName}
          </Link>
        </h3>
        {zone.streetName ? (
          <p className="mt-1 line-clamp-1 text-xs font-semibold text-herbal-green sm:text-sm">
            {zone.streetName}
          </p>
        ) : null}
        {zone.blockRanges.length > 0 ? (
          <p className="mt-2 line-clamp-1 text-xs text-herbal-muted sm:mt-3 sm:text-sm">
          Blok {zone.blockRanges.join(", ")}
          </p>
        ) : null}
        <p className="mt-2 line-clamp-2 flex-1 text-xs leading-5 text-herbal-muted sm:mt-3 sm:line-clamp-3 sm:text-sm sm:leading-6">
          {zone.shortDescription}
        </p>
        <PublicCardAction href={`/zona-kesehatan/${zone.slug}`}>
          Lihat detail zona
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
