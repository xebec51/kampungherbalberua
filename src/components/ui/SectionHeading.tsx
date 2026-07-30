import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  tone?: "light" | "dark";
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  tone = "light",
}: SectionHeadingProps) {
  return (
    <div className="max-w-3xl">
      {eyebrow ? (
        <p
          className={cn(
            "text-xs font-bold uppercase tracking-[0.16em] sm:text-sm",
            tone === "dark" ? "text-herbal-gold" : "text-herbal-brown",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={cn(
          "mt-3 text-2xl font-bold leading-tight tracking-normal sm:text-3xl lg:text-[2.15rem]",
          tone === "dark" ? "text-white" : "text-herbal-ink",
        )}
      >
        {title}
      </h2>
      {description ? (
        <div
          className={cn(
            "mt-4 text-base leading-7",
            tone === "dark" ? "text-white/78" : "text-herbal-muted",
          )}
        >
          {description}
        </div>
      ) : null}
    </div>
  );
}
