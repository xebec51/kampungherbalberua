"use client";

import { useMemo, useState } from "react";
import type { PosterPlantCatalogItem } from "@/types";
import { PosterPlantCard } from "@/components/plants/PosterPlantCard";
import { EmptyState } from "@/components/ui/EmptyState";

type PosterPlantCatalogProps = {
  plants: PosterPlantCatalogItem[];
};

const allCollectionsLabel = "Semua zona";

export function PosterPlantCatalog({ plants }: PosterPlantCatalogProps) {
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState(allCollectionsLabel);
  const collections = useMemo(
    () =>
      Array.from(new Set(plants.flatMap((plant) => plant.collections))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [plants],
  );
  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plants.filter((plant) => {
      const matchesCollection =
        collection === allCollectionsLabel ||
        plant.collections.includes(collection);
      const searchableText = [
        plant.rawName,
        plant.localName,
        plant.scientificName ?? "",
        ...plant.collections,
        String(plant.posterNumbers.join(" ")),
      ]
        .join(" ")
        .toLowerCase();

      return matchesCollection && searchableText.includes(normalizedQuery);
    });
  }, [collection, plants, query]);

  function resetFilters() {
    setQuery("");
    setCollection(allCollectionsLabel);
  }

  return (
    <div className="mt-8">
      <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_260px_auto] md:items-end">
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
              onChange={(event) => setQuery(event.target.value)}
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
              onChange={(event) => setCollection(event.target.value)}
              value={collection}
            >
              <option>{allCollectionsLabel}</option>
              {collections.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </div>
          <button
            className="h-11 rounded-md border border-herbal-green/20 px-4 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
            onClick={resetFilters}
            type="button"
          >
            Reset filter
          </button>
        </div>
        <p className="mt-4 text-sm text-herbal-muted" aria-live="polite">
          Menampilkan {filteredPlants.length} hasil tanaman.
        </p>
      </div>

      {filteredPlants.length > 0 ? (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlants.map((plant) => (
            <PosterPlantCard key={plant.normalizedName} plant={plant} />
          ))}
        </div>
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
