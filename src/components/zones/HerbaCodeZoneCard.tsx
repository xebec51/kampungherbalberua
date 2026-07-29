import Link from "next/link";
import type { HerbaCodeZoneSummary } from "@/types";
import {
  PublicCard,
  PublicCardAction,
  PublicCardBody,
} from "@/components/ui/PublicCard";
import { SafeImage } from "@/components/ui/SafeImage";
import { StatusBadge } from "@/components/ui/StatusBadge";

type HerbaCodeZoneCardProps = {
  zone: HerbaCodeZoneSummary;
};

export function HerbaCodeZoneCard({ zone }: HerbaCodeZoneCardProps) {
  return (
    <PublicCard>
      <SafeImage
        alt={zone.title}
        className="aspect-[16/10] !rounded-none !border-0 !shadow-none"
        fallbackLabel={zone.title}
        fallbackVariant="map"
        imageClassName="object-cover"
        sizes="(min-width: 1280px) 20rem, (min-width: 768px) 32vw, 86vw"
        src={null}
      />
      <PublicCardBody>
        <div className="flex flex-wrap gap-2">
          <StatusBadge tone="green">{zone.zoneCode}</StatusBadge>
          <StatusBadge tone="brown">{zone.plantCount} tanaman</StatusBadge>
        </div>
        <h3 className="mt-4 line-clamp-2 text-lg font-extrabold leading-tight text-herbal-ink">
          <Link
            className="transition hover:text-herbal-green"
            href={`/zona-kesehatan/${zone.slug}`}
          >
            {zone.title}
          </Link>
        </h3>
        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-herbal-muted">
          Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.
        </p>
        <PublicCardAction href={`/zona-kesehatan/${zone.slug}`}>
          Lihat detail zona
        </PublicCardAction>
      </PublicCardBody>
    </PublicCard>
  );
}
