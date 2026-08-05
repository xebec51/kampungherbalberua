"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { HerbaCodeZoneSummary } from "@/types";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { HerbaCodeZoneCard } from "@/components/zones/HerbaCodeZoneCard";
import { CatalogPageHeader } from "@/components/ui/CatalogPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterDialog } from "@/components/ui/FilterDialog";
import { SearchInput } from "@/components/ui/SearchInput";

type ZoneCatalogProps = {
  eyebrow: string;
  title: string;
  zones: HerbaCodeZoneSummary[];
};

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

export function ZoneCatalog({ eyebrow, title, zones }: ZoneCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const paramsRef = useRef(searchParamsString);
  const query = searchParams.get("q") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "default"
    : "default";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);

  useEffect(() => {
    paramsRef.current = searchParamsString;
  }, [searchParamsString]);

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(paramsRef.current);

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
      updateParam("q", nextQuery);
    }, 240);

    return () => window.clearTimeout(debounceId);
  }, [query, queryInput, updateParam]);

  const filteredZones = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return zones
      .filter((zone) => {
        const searchableText = [
          zone.title,
          zone.shortDescription,
          ...zone.streetNames,
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "default") return 0;
        if (sort === "za") return b.title.localeCompare(a.title, "id");
        if (sort === "tanaman") {
          return (
            b.plantCount - a.plantCount || a.title.localeCompare(b.title, "id")
          );
        }
        return a.title.localeCompare(b.title, "id");
      });
  }, [deferredQueryInput, sort, zones]);

  function resetFilters() {
    setQueryInput("");
    paramsRef.current = "";
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    sort !== "default"
      ? {
          key: "urut",
          label: `Urutan: ${
            sortOptions.find((option) => option.value === sort)?.label ?? sort
          }`,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  const filterDialog = (
    <FilterDialog
      activeCount={activeFilters.length}
      onReset={resetFilters}
      title="Atur filter zona"
    >
      <div className="sm:col-span-2">
        <SearchInput
          id="zone-search"
          label="Cari zona"
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Contoh: imunitas, pencernaan, jantung"
          value={queryInput}
        />
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
    </FilterDialog>
  );

  return (
    <div>
      <CatalogPageHeader eyebrow={eyebrow} filter={filterDialog} title={title} />
      {activeFilters.length > 0 ? (
        <div className="mt-3 flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-herbal-muted" aria-live="polite">
              {`Menampilkan ${filteredZones.length} dari ${zones.length} zona.`}
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
                  updateParam(activeFilter.key, "");
                }}
              >
                {activeFilter.label} - hapus
              </FilterChip>
            ))}
          </div>
        </div>
      ) : null}

      {filteredZones.length > 0 ? (
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {filteredZones.map((zone) => (
            <StaggerItem key={zone.zoneCode}>
              <HerbaCodeZoneCard zone={zone} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset pencarian."
            title="Zona tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
