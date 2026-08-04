import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminFormSectionProps = {
  children: ReactNode;
  className?: string;
  description?: string;
  title: string;
};

// Splits long admin forms into clearly labeled sections (identity,
// educational content, publication metadata, ...) instead of one long field
// list.
export function AdminFormSection({
  children,
  className,
  description,
  title,
}: AdminFormSectionProps) {
  return (
    <section
      className={cn(
        "grid gap-4 rounded-[var(--radius-card)] border border-admin-rail/12 bg-white p-5 shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <div>
        <h2 className="text-lg font-bold text-herbal-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-herbal-muted">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
