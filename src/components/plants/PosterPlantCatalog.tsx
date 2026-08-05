"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PosterPlantCatalogItem } from "@/types";
import { getPaginationWindow } from "@/lib/pagination";
import { plantCatalogSortOptions } from "@/lib/plant-catalog-filter";
import { cn } from "@/lib/utils";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { PosterPlantCard } from "@/components/plants/PosterPlantCard";
import { CatalogPageHeader } from "@/components/ui/CatalogPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterDialog } from "@/components/ui/FilterDialog";
import { SearchInput } from "@/components/ui/SearchInput";

type PosterPlantCatalogProps = {
  collections: string[];
  currentPage: number;
  eyebrow: string;
  filteredCount: number;
  items: PosterPlantCatalogItem[];
  parts: string[];
  title: string;
  totalCount: number;
  totalPages: number;
};

const allCollectionsLabel = "Semua zona";
const allPartsLabel = "Semua bagian";

export function PosterPlantCatalog({
  collections,
  currentPage,
  eyebrow,
  filteredCount,
  items,
  parts,
  title,
  totalCount,
  totalPages,
}: PosterPlantCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const paramsRef = useRef(searchParamsString);
  const query = searchParams.get("q") ?? "";
  const collection = searchParams.get("zona") ?? "";
  const part = searchParams.get("bagian") ?? "";
  const rawSort = searchParams.get("urut") ?? "";
  const sort = plantCatalogSortOptions.some((option) => option.value === rawSort)
    ? rawSort
    : "az";
  const [queryInput, setQueryInput] = useState(query);

  useEffect(() => {
    paramsRef.current = searchParamsString;
  }, [searchParamsString]);

  const updateParams = useCallback(
    (updates: Record<string, string>, resetPage = true) => {
      const params = new URLSearchParams(paramsRef.current);

      for (const [key, value] of Object.entries(updates)) {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      }

      if (resetPage) {
        params.delete("halaman");
      }

      router.replace(
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
        { scroll: false },
      );
      paramsRef.current = params.toString();
    },
    [pathname, router],
  );

  useEffect(() => {
    const syncId = window.setTimeout(() => setQueryInput(query), 0);

    return () => window.clearTimeout(syncId);
  }, [query]);

  useEffect(() => {
    const nextQuery = queryInput.trim();

    if (nextQuery === query) {
      return;
    }

    const debounceId = window.setTimeout(() => {
      updateParams({ q: nextQuery });
    }, 240);

    return () => window.clearTimeout(debounceId);
    // Only re-run when the local input value changes -- `query`/`updateParams`
    // changing as a *result* of this effect must not re-trigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryInput]);

  function resetFilters() {
    setQueryInput("");
    paramsRef.current = "";
    router.replace(pathname, { scroll: false });
  }

  function goToPage(page: number) {
    updateParams({ halaman: page > 1 ? String(page) : "" }, false);
  }

  const activeFilters = [
    query ? { key: "q", label: `Cari: ${query}` } : null,
    collection ? { key: "zona", label: `Zona: ${collection}` } : null,
    part ? { key: "bagian", label: `Bagian: ${part}` } : null,
    sort !== "az"
      ? {
          key: "urut",
          label: `Urutan: ${
            plantCatalogSortOptions.find((option) => option.value === sort)
              ?.label ?? sort
          }`,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  const filterDialog = (
    <FilterDialog
      activeCount={activeFilters.length}
      onReset={resetFilters}
      title="Atur filter tanaman"
    >
      <div className="sm:col-span-2">
        <SearchInput
          id="plant-search"
          label="Cari tanaman"
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Contoh: jahe, cincau, willow"
          value={queryInput}
        />
      </div>
      <div>
        <label
          className="block text-sm font-medium text-herbal-ink"
          htmlFor="plant-collection"
        >
          Filter zona
        </label>
        <select
          className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
          id="plant-collection"
          onChange={(event) => updateParams({ zona: event.target.value })}
          value={collection}
        >
          <option value="">{allCollectionsLabel}</option>
          {collections.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <label className="grid gap-2 text-sm font-medium text-herbal-ink">
        Filter bagian
        <select
          className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
          onChange={(event) => updateParams({ bagian: event.target.value })}
          value={part}
        >
          <option value="">{allPartsLabel}</option>
          {parts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-medium text-herbal-ink">
        Urutkan
        <select
          className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
          onChange={(event) => updateParams({ urut: event.target.value })}
          value={sort}
        >
          {plantCatalogSortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </FilterDialog>
  );

  return (
    <div>
      <CatalogPageHeader eyebrow={eyebrow} filter={filterDialog} title={title} />
      {activeFilters.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-herbal-muted" aria-live="polite">
              {`Menampilkan ${filteredCount} dari ${totalCount} tanaman.`}
            </p>
            <button
              className="text-sm font-bold text-herbal-green hover:underline"
              onClick={resetFilters}
              type="button"
            >
              Reset filter
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((activeFilter) => (
              <FilterChip
                key={activeFilter.key}
                onClick={() => {
                  if (activeFilter.key === "q") {
                    setQueryInput("");
                  }
                  updateParams({ [activeFilter.key]: "" });
                }}
              >
                {activeFilter.label} - hapus
              </FilterChip>
            ))}
          </div>
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <StaggerGroup className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((plant, index) => (
              <StaggerItem key={plant.id}>
                <PosterPlantCard
                  className="catalog-card"
                  plant={plant}
                  priority={index === 0}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
          {totalPages > 1 ? (
            <nav
              aria-label="Navigasi halaman katalog tanaman"
              className="mt-8 flex items-center justify-center gap-1.5"
            >
              <button
                aria-label="Halaman sebelumnya"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-herbal-green/20 bg-white text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                <PaginationChevron direction="left" />
              </button>
              {getPaginationWindow(currentPage, totalPages).map((page) => (
                <button
                  aria-current={page === currentPage ? "page" : undefined}
                  className={cn(
                    "inline-flex h-10 min-w-10 shrink-0 items-center justify-center rounded-md border px-2 text-sm font-bold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown",
                    page === currentPage
                      ? "border-herbal-green bg-herbal-green text-white"
                      : "border-herbal-green/20 bg-white text-herbal-green hover:bg-herbal-soft",
                  )}
                  key={page}
                  onClick={() => goToPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                aria-label="Halaman berikutnya"
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-herbal-green/20 bg-white text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                <PaginationChevron direction="right" />
              </button>
            </nav>
          ) : null}
        </>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter zona."
            title="Tanaman tidak ditemukan"
          />
        </div>
      )}
    </div>
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
