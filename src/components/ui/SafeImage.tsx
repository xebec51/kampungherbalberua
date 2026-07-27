"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";

type SafeImageProps = {
  src: string | null;
  alt: string;
  fallbackLabel: string;
  fallbackVariant?: "plant" | "recipe" | "product" | "activity" | "map";
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

export function SafeImage({
  src,
  alt,
  fallbackLabel,
  fallbackVariant = "plant",
  className,
  imageClassName,
  priority = false,
  sizes = "100vw",
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
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
        alt={alt}
        className={cn("object-cover", imageClassName)}
        fill
        onError={() => setHasError(true)}
        priority={priority}
        sizes={sizes}
        src={src}
      />
    </figure>
  );
}
