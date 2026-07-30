import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  eyebrow?: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  tone?: "cream" | "green";
};

export function PageHero({
  children,
  className,
  description,
  eyebrow,
  title,
  tone = "cream",
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "brand-pattern border-b py-10 sm:py-14",
        tone === "green"
          ? "border-white/10 bg-herbal-green text-white"
          : "border-herbal-green/10 bg-herbal-cream text-herbal-ink",
        className,
      )}
    >
      <Container>
        <div className="max-w-4xl">
          {eyebrow ? (
            <p
              className={cn(
                "text-sm font-bold uppercase tracking-[0.16em]",
                tone === "green" ? "text-herbal-gold" : "text-herbal-brown",
              )}
            >
              {eyebrow}
            </p>
          ) : null}
          <h1 className="mt-3 text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-5 max-w-3xl text-base leading-8 sm:text-lg",
                tone === "green" ? "text-white/82" : "text-herbal-muted",
              )}
            >
              {description}
            </p>
          ) : null}
        </div>
        {children ? <div className="mt-7">{children}</div> : null}
      </Container>
    </section>
  );
}
