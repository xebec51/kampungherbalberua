"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PosterPlantCatalogItem } from "@/types";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { PosterPlantCard } from "@/components/plants/PosterPlantCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchInput } from "@/components/ui/SearchInput";

type PosterPlantCatalogProps = {
  claimedPosterEntryCount: number;
  plants: PosterPlantCatalogItem[];
};

const allCollectionsLabel = "Semua zona";
const allPartsLabel = "Semua bagian";
const pageSize = 24;

const sortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Paling sering muncul", value: "frekuensi" },
  { label: "Paling banyak zona", value: "zona" },
  { label: "Gambar paling spesifik", value: "spesifik" },
  { label: "Urutan katalog Harmony", value: "poster" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function PosterPlantCatalog({
  claimedPosterEntryCount,
  plants,
}: PosterPlantCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const query = searchParams.get("q") ?? "";
  const collection = searchParams.get("zona") ?? "";
  const part = searchParams.get("bagian") ?? "";
  const imageKind = searchParams.get("gambar") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "az"
    : "az";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);
  const filterKey = [collection, imageKind, part, deferredQueryInput, sort].join(
    "\u0000",
  );
  const [visibleState, setVisibleState] = useState({
    count: pageSize,
    key: filterKey,
  });
  const visibleCount =
    visibleState.key === filterKey ? visibleState.count : pageSize;
  const collections = useMemo(
    () =>
      Array.from(new Set(plants.flatMap((plant) => plant.collections))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [plants],
  );
  const parts = useMemo(
    () =>
      Array.from(new Set(plants.map((plant) => plant.partCategory))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [plants],
  );
  const posterEntries = useMemo(
    () =>
      plants
        .flatMap((plant) =>
          plant.posterNumbers.map((posterNumber) => ({
            href: `/tanaman/${plant.linkedPlantSlug ?? plant.slug}`,
            name: plant.rawName,
            posterNumber,
            zones: plant.collections,
          })),
        )
        .sort((left, right) => left.posterNumber - right.posterNumber),
    [plants],
  );

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParamsString);

      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }

      router.replace(
        params.size > 0 ? `${pathname}?${params.toString()}` : pathname,
        {
          scroll: false,
        },
      );
    },
    [pathname, router, searchParamsString],
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
      updateParam("q", nextQuery);
    }, 240);

    return () => window.clearTimeout(debounceId);
  }, [query, queryInput, updateParam]);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return plants
      .filter((plant) => {
        const matchesCollection =
          !collection || plant.collections.includes(collection);
        const matchesPart = !part || plant.partCategory === part;
        const matchesImageKind = !imageKind || plant.imageKind === imageKind;
        const searchableText = [
          plant.rawName,
          plant.normalizedName,
          plant.localName,
          plant.scientificName ?? "",
          plant.partCategory,
          ...plant.collections,
          ...plant.searchAliases,
          String(plant.posterNumbers.join(" ")),
        ]
          .join(" ")
          .toLowerCase();

        return (
          matchesCollection &&
          matchesPart &&
          matchesImageKind &&
          searchableText.includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (sort === "za") return b.rawName.localeCompare(a.rawName, "id");
        if (sort === "frekuensi") {
          return b.posterOccurrenceCount - a.posterOccurrenceCount;
        }
        if (sort === "zona") {
          return b.collections.length - a.collections.length;
        }
        if (sort === "spesifik") {
          const score = { generic: 0, reference: 1, specific: 2 };
          return score[b.imageKind] - score[a.imageKind];
        }
        return a.rawName.localeCompare(b.rawName, "id");
      });
  }, [collection, deferredQueryInput, imageKind, part, plants, sort]);
  function resetFilters() {
    setQueryInput("");
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    collection ? { key: "zona", label: `Zona: ${collection}` } : null,
    part ? { key: "bagian", label: `Bagian: ${part}` } : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));
  const hasActiveFilters = activeFilters.length > 0 || Boolean(imageKind);
  const visibleLimit = hasActiveFilters ? filteredPlants.length : visibleCount;
  const visiblePlants = filteredPlants.slice(0, visibleLimit);
  const hasMore = !hasActiveFilters && visibleCount < filteredPlants.length;

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_220px_190px_180px_auto] lg:items-end">
          <SearchInput
            id="plant-search"
            label="Cari tanaman"
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Contoh: jahe, cincau, willow"
            value={queryInput}
          />
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
              onChange={(event) => updateParam("zona", event.target.value)}
              value={collection}
            >
              <option value="">{allCollectionsLabel}</option>
              {collections.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <label className="grid gap-2 text-sm font-medium text-herbal-ink">
            Filter bagian
            <select
              className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              onChange={(event) => updateParam("bagian", event.target.value)}
              value={part}
            >
              <option value="">{allPartsLabel}</option>
              {parts.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-medium text-herbal-ink">
            Urutkan
            <select
              className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              onChange={(event) => updateParam("urut", event.target.value)}
              value={sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <button
            className="h-11 rounded-md border border-herbal-green/20 px-4 text-sm font-bold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            onClick={resetFilters}
            type="button"
          >
            Reset filter
          </button>
        </div>
        <p className="mt-4 text-sm text-herbal-muted" aria-live="polite">
          Menampilkan {filteredPlants.length} dari {plants.length} tanaman.
        </p>
        {activeFilters.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <FilterChip
                key={filter.key}
                onClick={() => {
                  if (filter.key === "q") {
                    setQueryInput("");
                  }
                  updateParam(filter.key, "");
                }}
              >
                {filter.label} - hapus
              </FilterChip>
            ))}
          </div>
        ) : null}
      </div>

      {filteredPlants.length > 0 ? (
        <>
          <StaggerGroup className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visiblePlants.map((plant, index) => (
              <StaggerItem key={plant.normalizedName}>
                <PosterPlantCard
                  className="catalog-card"
                  plant={plant}
                  priority={index === 0}
                />
              </StaggerItem>
            ))}
          </StaggerGroup>
          {hasMore ? (
            <div className="mt-8 flex justify-center">
              <button
                aria-label={`Muat ${Math.min(pageSize, filteredPlants.length - visibleCount)} tanaman berikutnya`}
                className="min-h-11 rounded-md bg-herbal-green px-5 py-3 text-sm font-bold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                onClick={() =>
                  setVisibleState({
                    count: visibleCount + pageSize,
                    key: filterKey,
                  })
                }
                type="button"
              >
                Muat lebih banyak
              </button>
            </div>
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

      {posterEntries.length > 0 ? (
        <section className="mt-10 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-herbal-ink">
                Daftar nomor poster lama
              </h2>
              <p className="mt-2 text-sm leading-6 text-herbal-muted">
                Menampilkan {posterEntries.length} dari{" "}
                {claimedPosterEntryCount} nomor poster sumber. Nomor 157-166
                tidak ada pada sumber poster yang terbaca.
              </p>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2 lg:grid-cols-3 xl:grid-cols-4">
            {posterEntries.map((entry) => (
              <Link
                className="rounded-md border border-herbal-green/10 bg-herbal-cream/40 p-3 text-sm transition hover:border-herbal-green/35 hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                href={entry.href}
                key={entry.posterNumber}
              >
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-herbal-brown">
                  No. {entry.posterNumber}
                </span>
                <span className="mt-1 block font-bold text-herbal-ink">
                  {entry.name}
                </span>
                {entry.zones.length > 0 ? (
                  <span className="mt-1 line-clamp-2 block text-xs leading-5 text-herbal-muted">
                    {entry.zones.join(", ")}
                  </span>
                ) : null}
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
