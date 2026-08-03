export type PaginationResult<T> = {
  currentPage: number;
  endItem: number;
  items: T[];
  pageSize: number;
  startItem: number;
  totalItems: number;
  totalPages: number;
};

export function parsePageParam(value?: string): number {
  const page = Number.parseInt(value ?? "", 10);

  return Number.isFinite(page) && page > 0 ? page : 1;
}

export function paginateItems<T>(
  items: T[],
  requestedPage: number,
  pageSize: number,
): PaginationResult<T> {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = Math.min(Math.max(1, requestedPage), totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = items.slice(startIndex, startIndex + pageSize);

  return {
    currentPage,
    endItem: pageItems.length > 0 ? startIndex + pageItems.length : 0,
    items: pageItems,
    pageSize,
    startItem: pageItems.length > 0 ? startIndex + 1 : 0,
    totalItems,
    totalPages,
  };
}

export function getPaginationWindow(
  currentPage: number,
  totalPages: number,
  maxVisible = 5,
): number[] {
  const visibleCount = Math.min(maxVisible, totalPages);
  const half = Math.floor(visibleCount / 2);
  const start = Math.min(
    Math.max(1, currentPage - half),
    Math.max(1, totalPages - visibleCount + 1),
  );

  return Array.from({ length: visibleCount }, (_, index) => start + index);
}

export function buildPaginatedHref(
  pathname: string,
  params: Record<string, string | null | undefined>,
  page: number,
): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value && value !== "all") {
      searchParams.set(key, value);
    }
  }

  if (page > 1) {
    searchParams.set("halaman", String(page));
  }

  const query = searchParams.toString();

  return query ? `${pathname}?${query}` : pathname;
}
