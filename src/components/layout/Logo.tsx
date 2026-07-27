import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  tone?: "default" | "hero" | "solid";
};

export function Logo({ tone = "default" }: LogoProps) {
  const lightText = tone === "hero" || tone === "solid";

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4",
        lightText ? "focus-visible:outline-white" : "focus-visible:outline-herbal-brown",
      )}
      aria-label="Kampung Herbal Berua"
    >
      <span
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-md shadow-sm transition-colors",
          tone === "hero"
            ? "border border-white/[0.35] bg-white/[0.14] text-white backdrop-blur"
            : tone === "solid"
              ? "bg-white text-herbal-green"
              : "bg-herbal-green text-white",
        )}
      >
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.5 4.5C12 4.8 6.6 8.2 5.1 14.1c-.7 2.8.5 4.9 2.7 5.4 5.9 1.3 10.7-5.7 11.7-15Z"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.7"
          />
          <path
            d="M5.5 18.5c2.7-4.4 6-7.1 10.2-8.5"
            stroke="currentColor"
            strokeLinecap="round"
            strokeWidth="1.7"
          />
        </svg>
      </span>
      <span className="leading-tight">
        <span
          className={cn(
            "block text-sm font-bold",
            lightText ? "text-white" : "text-herbal-ink",
          )}
        >
          Kampung Herbal
        </span>
        <span
          className={cn(
            "block text-xs font-medium",
            lightText ? "text-white/[0.82]" : "text-herbal-muted",
          )}
        >
          Berua RT 009/RW 006
        </span>
      </span>
    </Link>
  );
}
