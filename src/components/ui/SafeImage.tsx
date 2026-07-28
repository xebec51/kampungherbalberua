"use client";

import Image from "next/image";
import { useState } from "react";
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
  sizes?: string;
  showAttribution?: boolean;
};

function shouldBypassOptimizer(src: string) {
  return src.includes(".supabase.co/storage/v1/object/public/");
}

export function SafeImage({
  src,
  media,
  alt,
  fallbackLabel,
  fallbackVariant = "plant",
  className,
  imageClassName,
  illustrationLabel = "Gambar pendamping",
  labelIllustration = false,
  priority = false,
  sizes = "100vw",
  showAttribution = false,
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);
  const resolvedSrc = media?.publicUrl ?? src;
  const resolvedAlt = media?.altText ?? alt;
  const attribution = media?.attributionText ?? media?.creatorName ?? null;

  if (!resolvedSrc || hasError) {
    return (
      <ImagePlaceholder
        className={className}
        label={fallbackLabel}
        variant={fallbackVariant}
      />
    );
  }

  return (
    <figure
      className={cn(
        "relative isolate aspect-[4/3] w-full overflow-hidden rounded-md border border-herbal-green/15 bg-herbal-soft shadow-sm",
        className,
      )}
    >
      <Image
        alt={resolvedAlt}
        className={cn("object-cover", imageClassName)}
        fill
        onError={() => setHasError(true)}
        priority={priority}
        unoptimized={shouldBypassOptimizer(resolvedSrc)}
        sizes={sizes}
        src={resolvedSrc}
      />
      {labelIllustration ? (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-herbal-deep shadow-sm">
          {illustrationLabel}
        </span>
      ) : null}
      {showAttribution && attribution ? (
        <figcaption className="absolute inset-x-0 bottom-0 bg-herbal-deep/80 px-3 py-2 text-xs leading-5 text-white">
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  );
}
