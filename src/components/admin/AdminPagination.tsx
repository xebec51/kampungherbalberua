import Link from "next/link";
import type { ReactNode } from "react";
import {
  buildPaginatedHref,
  getPaginationWindow,
  type PaginationResult,
} from "@/lib/pagination";
import { cn } from "@/lib/utils";

type AdminPaginationProps = Pick<
  PaginationResult<unknown>,
  "currentPage" | "endItem" | "startItem" | "totalItems" | "totalPages"
> & {
  params: Record<string, string | null | undefined>;
  pathname: string;
};

export function AdminPagination({
  currentPage,
  endItem,
  params,
  pathname,
  startItem,
  totalItems,
  totalPages,
}: AdminPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPaginationWindow(currentPage, totalPages);

  return (
    <nav
      aria-label="Navigasi halaman admin"
      className="flex flex-col gap-3 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="text-sm text-herbal-muted">
        Menampilkan {startItem}-{endItem} dari {totalItems} data
      </p>
      <div className="flex flex-wrap items-center gap-1.5">
        <PaginationLink
          ariaLabel="Halaman sebelumnya"
          disabled={currentPage <= 1}
          href={buildPaginatedHref(pathname, params, currentPage - 1)}
          square
        >
          <PaginationChevron direction="left" />
        </PaginationLink>
        {pages.map((page) => (
          <PaginationLink
            ariaCurrent={page === currentPage ? "page" : undefined}
            href={buildPaginatedHref(pathname, params, page)}
            key={page}
          >
            {page}
          </PaginationLink>
        ))}
        <PaginationLink
          ariaLabel="Halaman berikutnya"
          disabled={currentPage >= totalPages}
          href={buildPaginatedHref(pathname, params, currentPage + 1)}
          square
        >
          <PaginationChevron direction="right" />
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  ariaCurrent,
  ariaLabel,
  children,
  disabled = false,
  href,
  square = false,
}: {
  ariaCurrent?: "page";
  ariaLabel?: string;
  children: ReactNode;
  disabled?: boolean;
  href: string;
  square?: boolean;
}) {
  const className = cn(
    "inline-flex min-h-10 items-center justify-center rounded-md border text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
    square ? "w-10 shrink-0" : "min-w-10 px-3",
    ariaCurrent
      ? "border-herbal-green bg-herbal-green text-white"
      : "border-herbal-green/20 bg-white text-herbal-green hover:bg-herbal-soft",
    disabled &&
      "pointer-events-none cursor-not-allowed opacity-40 hover:bg-white",
  );

  if (disabled) {
    return (
      <span aria-disabled="true" aria-label={ariaLabel} className={className}>
        {children}
      </span>
    );
  }

  return (
    <Link
      aria-current={ariaCurrent}
      aria-label={ariaLabel}
      className={className}
      href={href}
    >
      {children}
    </Link>
  );
}

function PaginationChevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={direction === "right" ? "M7 4.5 12.5 10 7 15.5" : "M13 4.5 7.5 10 13 15.5"}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}
