import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminEmptyStateProps = {
  action?: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

export function AdminEmptyState({
  action,
  className,
  description,
  title,
}: AdminEmptyStateProps) {
  return (
    <section
      className={cn(
        "grid place-items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-herbal-green/25 bg-white p-10 text-center shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <p className="text-base font-bold text-herbal-ink">{title}</p>
      {description ? (
        <p className="max-w-md text-sm leading-6 text-herbal-muted">{description}</p>
      ) : null}
      {action}
    </section>
  );
}
