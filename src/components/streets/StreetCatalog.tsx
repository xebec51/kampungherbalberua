"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { PublicStreet } from "@/lib/data/streets";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { StreetCard } from "@/components/streets/StreetCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchInput } from "@/components/ui/SearchInput";

type StreetCatalogProps = {
  streets: PublicStreet[];
};

const allZonesLabel = "Semua zona";

const sortOptions = [
  { label: "Urutan asli", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Tanaman terbanyak", value: "tanaman" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function StreetCatalog({ streets }: StreetCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const query = searchParams.get("q") ?? "";
  const zone = searchParams.get("zona") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "default"
    : "default";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);
  const zones = useMemo(
    () =>
      Array.from(
        new Set(
          streets.flatMap((street) =>
            street.relatedZones.map((relatedZone) => relatedZone.title),
          ),
        ),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [streets],
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

  const filteredStreets = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return streets
      .filter((street) => {
        const matchesZone =
          !zone || street.relatedZones.some((relatedZone) => relatedZone.title === zone);
        const searchableText = [
          street.streetName,
          street.description ?? "",
          ...street.blockRanges,
          ...street.relatedZones.map((relatedZone) => relatedZone.title),
        ]
          .join(" ")
          .toLowerCase();

        return matchesZone && searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "default") return 0;
        if (sort === "za") return b.streetName.localeCompare(a.streetName, "id");
        if (sort === "tanaman") {
          return (
            b.plantCount - a.plantCount ||
            a.streetName.localeCompare(b.streetName, "id")
          );
        }
        return a.streetName.localeCompare(b.streetName, "id");
      });
  }, [deferredQueryInput, sort, streets, zone]);

  function resetFilters() {
    setQueryInput("");
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    zone ? { key: "zona", label: `Zona: ${zone}` } : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_200px_170px_auto] lg:items-end">
          <SearchInput
            id="street-search"
            label="Cari jalan"
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Contoh: imun, digestia, blok E"
            value={queryInput}
          />
          <div>
            <label
              className="block text-sm font-medium text-herbal-ink"
              htmlFor="street-zone"
            >
              Filter zona
            </label>
            <select
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="street-zone"
              onChange={(event) => updateParam("zona", event.target.value)}
              value={zone}
            >
              <option value="">{allZonesLabel}</option>
              {zones.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <label className="grid gap-2 text-sm font-medium text-herbal-ink">
            Urutkan
            <select
              className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              onChange={(event) => updateParam("urut", event.target.value)}
              value={sort}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
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
          Menampilkan {filteredStreets.length} dari {streets.length} jalan.
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

      {filteredStreets.length > 0 ? (
        <StaggerGroup className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filteredStreets.map((street, index) => (
            <StaggerItem key={street.slug}>
              <StreetCard priority={index === 0} street={street} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter zona."
            title="Jalan tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
