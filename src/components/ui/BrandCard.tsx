import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type BrandCardProps = {
  children: ReactNode;
  className?: string;
  as?: "article" | "section" | "div";
};

export function BrandCard({
  as: Component = "article",
  children,
  className,
}: BrandCardProps) {
  return (
    <Component
      className={cn(
        "h-full rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
