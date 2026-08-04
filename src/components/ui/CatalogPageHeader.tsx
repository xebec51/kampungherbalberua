import type { ReactNode } from "react";

type CatalogPageHeaderProps = {
  eyebrow: string;
  filter: ReactNode;
  title: string;
};

// Keeps the H1 and the filter trigger on one row at lg:+ instead of the
// filter sitting in its own section below a full-width title -- the filter
// itself only grows into a bordered box once a filter is actually active
// (see FilterDialog.tsx), so by default this row is just title + a single
// compact button.
export function CatalogPageHeader({ eyebrow, filter, title }: CatalogPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-herbal-brown">
          {eyebrow}
        </p>
        <h1 className="mt-1 text-2xl font-bold leading-tight text-herbal-ink sm:text-3xl">
          {title}
        </h1>
      </div>
      <div className="shrink-0">{filter}</div>
    </div>
  );
}
