"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PosterPlantCatalogItem } from "@/types";
import { PosterPlantCard } from "@/components/plants/PosterPlantCard";
import { EmptyState } from "@/components/ui/EmptyState";

type PosterPlantCatalogProps = {
  plants: PosterPlantCatalogItem[];
};

const allCollectionsLabel = "Semua zona";
const allPartsLabel = "Semua bagian";
const allImagesLabel = "Semua gambar";
const pageSize = 24;

const imageKindOptions = [
  { label: allImagesLabel, value: "" },
  { label: "Foto spesifik", value: "specific" },
  { label: "Ilustrasi referensi", value: "reference" },
  { label: "Ilustrasi umum", value: "generic" },
];

const sortOptions = [
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Paling sering muncul", value: "frekuensi" },
  { label: "Paling banyak zona", value: "zona" },
  { label: "Foto paling spesifik", value: "spesifik" },
  { label: "Nama dari poster", value: "poster" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function PosterPlantCatalog({ plants }: PosterPlantCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const collection = searchParams.get("zona") ?? "";
  const part = searchParams.get("bagian") ?? "";
  const imageKind = searchParams.get("gambar") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "az"
    : "az";
  const filterKey = [collection, imageKind, part, query, sort].join("\u0000");
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

  const filteredPlants = useMemo(() => {
    const normalizedQuery = normalize(query);

    return plants
      .filter((plant) => {
      const matchesCollection =
        !collection ||
        plant.collections.includes(collection);
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
  }, [collection, imageKind, part, plants, query, sort]);
  const visiblePlants = filteredPlants.slice(0, visibleCount);
  const hasMore = visibleCount < filteredPlants.length;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname, {
      scroll: false,
    });
  }

  function resetFilters() {
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    query ? { key: "q", label: `Cari: ${query}` } : null,
    collection ? { key: "zona", label: `Zona: ${collection}` } : null,
    part ? { key: "bagian", label: `Bagian: ${part}` } : null,
    imageKind
      ? {
          key: "gambar",
          label:
            imageKindOptions.find((option) => option.value === imageKind)?.label ??
            imageKind,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <div className="mt-8">
      <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_190px_190px_180px_auto] lg:items-end">
          <div>
            <label
              className="block text-sm font-semibold text-herbal-ink"
              htmlFor="plant-search"
            >
              Cari tanaman
            </label>
            <input
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition placeholder:text-herbal-muted/70 focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="plant-search"
              onChange={(event) => updateParam("q", event.target.value)}
              placeholder="Contoh: jahe, cincau, willow"
              type="search"
              value={query}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-herbal-ink"
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
          <label className="grid gap-2 text-sm font-semibold text-herbal-ink">
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
          <label className="grid gap-2 text-sm font-semibold text-herbal-ink">
            Jenis gambar
            <select
              className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              onChange={(event) => updateParam("gambar", event.target.value)}
              value={imageKind}
            >
              {imageKindOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-herbal-ink">
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
            className="h-11 rounded-md border border-herbal-green/20 px-4 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            onClick={resetFilters}
            type="button"
          >
            Reset filter
          </button>
        </div>
        <p className="mt-4 text-sm text-herbal-muted" aria-live="polite">
          Menampilkan {filteredPlants.length} dari total {plants.length} tanaman.
        </p>
        {activeFilters.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                className="rounded-full border border-herbal-green/20 bg-herbal-soft px-3 py-1 text-xs font-semibold text-herbal-deep hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                key={filter.key}
                onClick={() => updateParam(filter.key, "")}
                type="button"
              >
                {filter.label} x
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {filteredPlants.length > 0 ? (
        <>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visiblePlants.map((plant) => (
              <PosterPlantCard key={plant.normalizedName} plant={plant} />
            ))}
          </div>
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
    </div>
  );
}
