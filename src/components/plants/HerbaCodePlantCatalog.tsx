"use client";

import { useMemo, useState } from "react";
import type { HerbaCodePlantProfile } from "@/types";
import { HerbaCodePlantCard } from "@/components/plants/HerbaCodePlantCard";
import { EmptyState } from "@/components/ui/EmptyState";

type HerbaCodePlantCatalogProps = {
  plants: HerbaCodePlantProfile[];
};

const allZonesLabel = "Semua zona";

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function HerbaCodePlantCatalog({ plants }: HerbaCodePlantCatalogProps) {
  const [query, setQuery] = useState("");
  const [zone, setZone] = useState(allZonesLabel);
  const zones = useMemo(
    () =>
      Array.from(
        new Set(plants.flatMap((plant) => plant.zoneEntries.map((entry) => entry.zoneTitle))),
      ).sort((left, right) => left.localeCompare(right, "id")),
    [plants],
  );
  const filteredPlants = useMemo(() => {
    const normalizedQuery = normalize(query);

    return plants.filter((plant) => {
      const matchesZone =
        zone === allZonesLabel ||
        plant.zoneEntries.some((entry) => entry.zoneTitle === zone);
      const searchableText = [
        plant.localName,
        plant.scientificName ?? "",
        ...plant.aliases,
        ...plant.zoneEntries.flatMap((entry) => [
          entry.zoneTitle,
          entry.localName,
          entry.scientificName ?? "",
          ...entry.activeCompounds,
          ...entry.usedParts,
        ]),
      ]
        .join(" ")
        .toLowerCase();

      return matchesZone && searchableText.includes(normalizedQuery);
    });
  }, [plants, query, zone]);

  function resetFilters() {
    setQuery("");
    setZone(allZonesLabel);
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
              placeholder="Cari nama, zona, atau senyawa"
              type="search"
              value={query}
            />
          </div>
          <div>
            <label
              className="block text-sm font-semibold text-herbal-ink"
              htmlFor="plant-zone"
            >
              Filter zona
            </label>
            <select
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="plant-zone"
              onChange={(event) => setZone(event.target.value)}
              value={zone}
            >
              <option>{allZonesLabel}</option>
              {zones.map((item) => (
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
          Menampilkan {filteredPlants.length} dari {plants.length} tanaman.
        </p>
      </div>

      {filteredPlants.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredPlants.map((plant, index) => (
            <HerbaCodePlantCard
              className="catalog-card"
              key={plant.id}
              plant={plant}
              priority={index === 0}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Gunakan kata kunci lain atau reset filter zona."
            title="Tanaman tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
