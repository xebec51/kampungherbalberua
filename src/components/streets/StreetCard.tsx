import type { PublicStreet } from "@/lib/data/streets";

type StreetCardProps = {
  compact?: boolean;
  street: PublicStreet;
};

export function StreetCard({ compact = false, street }: StreetCardProps) {
  return (
    <article
      className={
        compact
          ? "relative min-h-28 overflow-hidden rounded-md border border-herbal-brown/20 bg-white p-4 shadow-sm"
          : "relative overflow-hidden rounded-md border border-herbal-brown/20 bg-white p-5 shadow-sm"
      }
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1 bg-[repeating-linear-gradient(90deg,#8a5a2d_0_2rem,transparent_2rem_3rem)]"
      />
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
    </article>
  );
}
