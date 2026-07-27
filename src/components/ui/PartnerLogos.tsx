import Image from "next/image";
import { cn } from "@/lib/utils";

const partnerLogos = [
  {
    alt: "Logo Kuliah Kerja Nyata Universitas Hasanuddin",
    height: 359,
    imageClassName: "max-h-12 max-w-[12rem]",
    imageClassNameCompact: "max-h-8 max-w-[8.5rem]",
    name: "KKN Universitas Hasanuddin",
    src: "/images/partners/logo-kkn-unhas.png",
    width: 694,
  },
  {
    alt: "Logo Pemerintah Kota Makassar",
    height: 1354,
    imageClassName: "max-h-16 max-w-[5rem]",
    imageClassNameCompact: "max-h-11 max-w-[3.5rem]",
    name: "Pemerintah Kota Makassar",
    src: "/images/partners/logo-pemkot-makassar.png",
    width: 1080,
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
            src={partner.src}
            width={partner.width}
          />
        </div>
      ))}
    </div>
  );
}
