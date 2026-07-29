"use client";

import { useMemo, useState } from "react";
import type { Plant, PlantCategory } from "@/types";
import { PlantCard } from "@/components/plants/PlantCard";
import { EmptyState } from "@/components/ui/EmptyState";

type PlantCatalogProps = {
  plants: Plant[];
  categories: PlantCategory[];
};

const allCategoriesLabel = "Semua kategori";

export function PlantCatalog({ plants, categories }: PlantCatalogProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(allCategoriesLabel);

  const filteredPlants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return plants.filter((plant) => {
      const matchesCategory =
        category === allCategoriesLabel || plant.category === category;
      const searchableText = [
        plant.localName,
        plant.scientificName,
        plant.category,
        plant.shortDescription,
        ...plant.otherNames,
      ]
        .join(" ")
        .toLowerCase();

      return matchesCategory && searchableText.includes(normalizedQuery);
    });
  }, [category, plants, query]);

  function resetFilters() {
    setQuery("");
    setCategory(allCategoriesLabel);
  }

  return (
    <div className="mt-8">
      <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_240px_auto] md:items-end">
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
              placeholder="Contoh: jahe, rimpang, telang"
              type="search"
              value={query}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-herbal-ink"
              htmlFor="plant-category"
            >
              Filter kategori
            </label>
            <select
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="plant-category"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option>{allCategoriesLabel}</option>
              {categories.map((item) => (
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
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlants.map((plant) => (
            <PlantCard className="catalog-card" key={plant.id} plant={plant} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter kategori."
            title="Tanaman tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
