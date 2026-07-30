import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  compact?: boolean;
  priority?: boolean;
  tone?: "default" | "hero" | "solid";
};

export function Logo({
  className,
  compact = false,
  priority = false,
  tone = "default",
}: LogoProps) {
  const lightText = tone === "hero" || tone === "solid";
  const src = lightText
    ? compact
      ? "/brand/logo/kampung-herbal-vertical-white.png"
      : "/brand/logo/kampung-herbal-wide-white.png"
    : compact
      ? "/brand/logo/kampung-herbal-vertical-main.png"
      : "/brand/logo/kampung-herbal-wide-main.png";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4",
        lightText ? "focus-visible:outline-white" : "focus-visible:outline-herbal-brown",
        className,
      )}
      aria-label="Kampung Herbal Berua"
    >
      <Image
        alt="Logo Kampung Herbal Harmony Berua"
        className={cn(
          "h-auto w-auto object-contain",
          compact ? "max-h-12 max-w-[4.75rem]" : "max-h-12 max-w-[13.5rem]",
        )}
        height={compact ? 104 : 191}
        loading={priority ? "eager" : "lazy"}
        preload={priority}
        sizes={compact ? "5rem" : "14rem"}
        src={src}
        width={compact ? 160 : 900}
      />
    </Link>
  );
}
