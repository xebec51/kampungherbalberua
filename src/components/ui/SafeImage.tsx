import Image from "next/image";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import type { PublicMediaAsset } from "@/types";

type SafeImageProps = {
  src?: string | null;
  media?: PublicMediaAsset | null;
  alt: string;
  fallbackLabel: string;
  fallbackVariant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
  imageClassName?: string;
  illustrationLabel?: string;
  labelIllustration?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  showAttribution?: boolean;
};

function shouldBypassOptimizer(src: string) {
  return (
    src.startsWith("data:") ||
    src.endsWith(".svg") ||
    /supabase\.co\/storage\/v1\/object\/public\//.test(src)
  );
}

function isLocalPlaceholder(src: string) {
  return src.startsWith("/images/placeholders/");
}

export function SafeImage({
  src,
  media,
  alt,
  fallbackLabel,
  fallbackVariant = "plant",
  className,
  imageClassName,
  illustrationLabel = "Visual referensi",
  labelIllustration = false,
  priority = false,
  quality = 72,
  sizes = "100vw",
  showAttribution = false,
}: SafeImageProps) {
  const resolvedSrc = media?.publicUrl ?? src;
  const resolvedAlt = media?.altText ?? alt;
  const attribution = media?.attributionText ?? media?.creatorName ?? null;

  if (!resolvedSrc || isLocalPlaceholder(resolvedSrc)) {
    return (
      <ImagePlaceholder
        className={className}
        label={fallbackLabel}
        variant={fallbackVariant}
      />
    );
  }

  return (
    <figure>
      <div
        className={cn(
          "public-card-media relative isolate aspect-[4/3] w-full overflow-hidden rounded-md border border-herbal-green/12 bg-herbal-soft shadow-sm",
          className,
        )}
      >
        <Image
          alt={resolvedAlt}
          className={cn(
            "object-cover transition-transform duration-700 ease-out group-hover/card:scale-[1.035]",
            imageClassName,
          )}
          decoding="async"
          fill
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          preload={priority}
          quality={quality}
          unoptimized={shouldBypassOptimizer(resolvedSrc)}
          sizes={sizes}
          src={resolvedSrc}
        />
        {labelIllustration ? (
          <span className="absolute left-3 top-3 z-10 rounded-full border border-white/70 bg-white/90 px-3 py-1 text-xs font-bold text-herbal-deep shadow-sm backdrop-blur">
            {illustrationLabel}
          </span>
        ) : null}
      </div>
      {showAttribution && attribution ? (
        <figcaption
          className="mt-2 line-clamp-2 text-xs leading-5 text-herbal-muted"
          title={attribution}
        >
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
