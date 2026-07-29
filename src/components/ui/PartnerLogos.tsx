import Image from "next/image";
import { cn } from "@/lib/utils";

const partnerLogos = [
  {
    alt: "Logo Kuliah Kerja Nyata Universitas Hasanuddin",
    height: 99,
    imageClassName: "max-h-12 max-w-[12rem]",
    imageClassNameCompact: "max-h-8 max-w-[8.5rem]",
    name: "KKN Universitas Hasanuddin",
    sizes: "(max-width: 640px) 8.5rem, 12rem",
    src: "/images/partners/logo-kkn-unhas.webp",
    width: 192,
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
};

export function PartnerLogos({
  className,
  compact = false,
  itemClassName,
}: PartnerLogosProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {partnerLogos.map((partner) => (
        <div
          className={cn(
            "flex items-center justify-center rounded-md border border-herbal-green/15 bg-white px-4 shadow-sm",
            compact ? "h-14" : "h-20",
            itemClassName,
          )}
          key={partner.name}
        >
          <Image
            alt={partner.alt}
            className={cn(
              "h-auto w-auto object-contain",
              compact
                ? partner.imageClassNameCompact
                : partner.imageClassName,
            )}
            height={partner.height}
            loading="lazy"
            quality={76}
            sizes={partner.sizes}
            src={partner.src}
            width={partner.width}
          />
        </div>
      ))}
    </div>
  );
}
