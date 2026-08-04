import Image from "next/image";
import { cn } from "@/lib/utils";

const partnerLogos = [
  {
    alt: "Logo Kelompok KKN Kampung Herbal Berua",
    height: 1207,
    imageClassName: "max-h-16 max-w-[4.75rem]",
    imageClassNameCompact: "max-h-10 max-w-[3.25rem]",
    name: "Kelompok KKN Kampung Herbal Berua",
    sizes: "(max-width: 640px) 3.25rem, 4.75rem",
    src: "/images/partners/logo-kelompok-kkn.webp",
    width: 900,
  },
  {
    alt: "Logo KKN Universitas Hasanuddin",
    height: 199,
    imageClassName: "max-h-16 max-w-[7.75rem]",
    imageClassNameCompact: "max-h-10 max-w-[4.85rem]",
    name: "KKN Universitas Hasanuddin",
    sizes: "(max-width: 640px) 4.85rem, 7.75rem",
    src: "/images/partners/logo-kkn-unhas.webp",
    width: 384,
  },
  {
    alt: "Logo Universitas Hasanuddin",
    height: 836,
    imageClassName: "max-h-16 max-w-[4.75rem]",
    imageClassNameCompact: "max-h-10 max-w-[3.25rem]",
    name: "Universitas Hasanuddin",
    sizes: "(max-width: 640px) 3.25rem, 4.75rem",
    src: "/images/partners/logo-unhas.webp",
    width: 700,
  },
  {
    alt: "Logo Pemerintah Kota Makassar",
    height: 80,
    imageClassName: "max-h-16 max-w-[5rem]",
    imageClassNameCompact: "max-h-11 max-w-[3.5rem]",
    name: "Pemerintah Kota Makassar",
    sizes: "(max-width: 640px) 3.5rem, 5rem",
    src: "/images/partners/logo-pemkot-makassar.webp",
    width: 64,
  },
];

type PartnerLogosProps = {
  className?: string;
  compact?: boolean;
  itemClassName?: string;
  /** Force exactly one row (4 equal columns that shrink to fit) instead of wrapping. */
  singleRow?: boolean;
};

export function PartnerLogos({
  className,
  compact = false,
  itemClassName,
  singleRow = false,
}: PartnerLogosProps) {
  return (
    <div
      className={cn(
        singleRow
          ? "grid grid-cols-4 gap-1.5 sm:gap-2"
          : "flex flex-wrap items-center gap-3",
        className,
      )}
    >
      {partnerLogos.map((partner) => (
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-herbal-green/15 bg-white shadow-sm",
            singleRow ? "h-11 px-1 sm:h-12 sm:px-1.5" : "px-4",
            !singleRow && (compact ? "h-14" : "h-20"),
            itemClassName,
          )}
          key={partner.name}
        >
          <Image
            alt={partner.alt}
            className={cn(
              "object-contain",
              singleRow
                ? "h-auto max-h-7 w-full sm:max-h-8"
                : cn(
                    "h-auto w-auto",
                    compact ? partner.imageClassNameCompact : partner.imageClassName,
                  ),
            )}
            height={partner.height}
            loading="lazy"
            quality={76}
            sizes={singleRow ? "18vw" : partner.sizes}
            src={partner.src}
            width={partner.width}
          />
        </div>
      ))}
    </div>
  );
}
