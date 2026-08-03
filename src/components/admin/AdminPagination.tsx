import Link from "next/link";
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
      <div className="flex flex-wrap items-center gap-2">
        <PaginationLink
          disabled={currentPage <= 1}
          href={buildPaginatedHref(pathname, params, currentPage - 1)}
        >
          Sebelumnya
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
          disabled={currentPage >= totalPages}
          href={buildPaginatedHref(pathname, params, currentPage + 1)}
        >
          Selanjutnya
        </PaginationLink>
      </div>
    </nav>
  );
}

function PaginationLink({
  ariaCurrent,
  children,
  disabled = false,
  href,
}: {
  ariaCurrent?: "page";
  children: string | number;
  disabled?: boolean;
  href: string;
}) {
  const className = cn(
    "inline-flex min-h-10 min-w-10 items-center justify-center rounded-md border px-3 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
    ariaCurrent
      ? "border-herbal-green bg-herbal-green text-white"
      : "border-herbal-green/20 bg-white text-herbal-green hover:bg-herbal-soft",
    disabled &&
      "pointer-events-none cursor-not-allowed opacity-40 hover:bg-white",
  );

  if (disabled) {
    return (
      <span aria-disabled="true" className={className}>
        {children}
      </span>
    );
  }

  return (
    <Link aria-current={ariaCurrent} className={className} href={href}>
      {children}
    </Link>
  );
}
