import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AdminPageHeaderProps = {
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
  className?: string;
  description?: string;
  eyebrow: string;
  title: string;
};

export function AdminPageHeader({
  actions,
  backHref,
  backLabel = "Kembali",
  className,
  description,
  eyebrow,
  title,
}: AdminPageHeaderProps) {
  return (
    <header
      className={cn(
        "rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-6",
        className,
      )}
    >
      {backHref ? (
        <Link
          className="mb-3 inline-flex items-center gap-1 text-sm font-semibold text-herbal-green hover:underline"
          href={backHref}
        >
          &larr; {backLabel}
        </Link>
      ) : null}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold tracking-normal text-herbal-ink sm:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-3 max-w-2xl text-sm leading-6 text-herbal-muted">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
    </header>
  );
}
