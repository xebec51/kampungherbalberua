"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PosterPlantCatalogItem } from "@/types";
import { plantCatalogSortOptions } from "@/lib/plant-catalog-filter";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { PosterPlantCard } from "@/components/plants/PosterPlantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterDialog } from "@/components/ui/FilterDialog";
import { SearchInput } from "@/components/ui/SearchInput";

type PosterPlantCatalogProps = {
  collections: string[];
  currentPage: number;
  filteredCount: number;
  items: PosterPlantCatalogItem[];
  parts: string[];
  totalCount: number;
  totalPages: number;
};

const allCollectionsLabel = "Semua zona";
const allPartsLabel = "Semua bagian";

export function PosterPlantCatalog({
  collections,
  currentPage,
  filteredCount,
  items,
  parts,
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

  return (
    <div>
      <FilterDialog
        activeCount={activeFilters.length}
        onReset={resetFilters}
        resultSummary={`Menampilkan ${filteredCount} dari ${totalCount} tanaman.`}
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
      {activeFilters.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {activeFilters.map((filter) => (
            <FilterChip
              key={filter.key}
              onClick={() => {
                if (filter.key === "q") {
                  setQueryInput("");
                }
                updateParams({ [filter.key]: "" });
              }}
            >
              {filter.label} - hapus
            </FilterChip>
          ))}
        </div>
      ) : null}

      {items.length > 0 ? (
        <>
          <StaggerGroup className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((plant, index) => (
              <StaggerItem key={plant.normalizedName}>
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
              className="mt-8 flex flex-wrap items-center justify-center gap-2"
            >
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green/20 bg-white px-4 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                disabled={currentPage <= 1}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                Sebelumnya
              </button>
              <span className="px-2 text-sm font-semibold text-herbal-muted">
                Halaman {currentPage} dari {totalPages}
              </span>
              <button
                className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green/20 bg-white px-4 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white"
                disabled={currentPage >= totalPages}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                Selanjutnya
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
