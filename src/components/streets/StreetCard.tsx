import Image from "next/image";
import Link from "next/link";
import type { PublicStreet } from "@/lib/data/streets";

type StreetCardProps = {
  compact?: boolean;
  priority?: boolean;
  street: PublicStreet;
};

export function StreetCard({
  compact = false,
  priority = false,
  street,
}: StreetCardProps) {
  return (
    <Link
      aria-label={`Buka detail ${street.streetName}`}
      className={
        compact
          ? "group relative flex min-h-32 flex-col overflow-hidden rounded-md border border-herbal-brown/20 bg-white shadow-sm transition hover:border-herbal-brown/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
          : "group relative flex h-full flex-col overflow-hidden rounded-md border border-herbal-brown/20 bg-white shadow-sm transition hover:border-herbal-brown/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
      }
      href={`/jalan/${street.slug}`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#8a5a2d_0_2rem,transparent_2rem_3rem)]"
      />
      {street.imagePath ? (
        <div className={compact ? "relative aspect-[16/9]" : "relative aspect-[4/3]"}>
          <Image
            alt={street.imageAlt}
            className="object-cover transition duration-500 group-hover:scale-[1.03]"
            fill
            priority={priority}
            sizes={
              compact
                ? "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 18rem"
                : "(max-width: 640px) 92vw, (max-width: 1024px) 44vw, 26rem"
            }
            src={street.imagePath}
          />
        </div>
      ) : null}
      <div className={compact ? "flex flex-1 flex-col p-4" : "flex flex-1 flex-col p-5"}>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
          Jalan tematik
        </p>
        <h3
          className={
            compact
              ? "mt-2 text-base font-extrabold leading-tight text-herbal-ink"
              : "mt-3 text-lg font-extrabold leading-tight text-herbal-ink"
          }
        >
          {street.streetName}
        </h3>
        {street.description && !compact ? (
          <p className="mt-3 text-sm leading-6 text-herbal-muted">
            {street.description}
          </p>
        ) : null}
        <p className="mt-3 text-sm font-semibold text-herbal-green">
          {street.plantCount} entri tanaman
        </p>
      </div>
    </Link>
  );
}
