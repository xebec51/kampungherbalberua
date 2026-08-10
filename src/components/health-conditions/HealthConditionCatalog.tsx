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
import type { HealthCondition } from "@/types";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { HealthConditionCard } from "@/components/health-conditions/HealthConditionCard";
import { CatalogPageHeader } from "@/components/ui/CatalogPageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterDialog } from "@/components/ui/FilterDialog";
import { SearchInput } from "@/components/ui/SearchInput";

type HealthConditionCatalogProps = {
  eyebrow: string;
  healthConditions: HealthCondition[];
  title: string;
};

const sortOptions = [
  { label: "Urutan asli", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function HealthConditionCatalog({
  eyebrow,
  healthConditions,
  title,
}: HealthConditionCatalogProps) {
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

  const filteredHealthConditions = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return healthConditions
      .filter((healthCondition) => {
        const searchableText = [
          healthCondition.name,
          healthCondition.shortDescription,
          ...healthCondition.linkedPlants.map((link) => link.displayName),
        ]
          .join(" ")
          .toLowerCase();

        return searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "default") return a.sortOrder - b.sortOrder;
        if (sort === "za") return b.name.localeCompare(a.name, "id");
        return a.name.localeCompare(b.name, "id");
      });
  }, [deferredQueryInput, healthConditions, sort]);

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
      title="Atur filter penyakit"
    >
      <div className="sm:col-span-2">
        <SearchInput
          id="health-condition-search"
          label="Cari penyakit"
          onChange={(event) => setQueryInput(event.target.value)}
          placeholder="Contoh: hipertensi, demam, tanaman jahe"
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
              {`Menampilkan ${filteredHealthConditions.length} dari ${healthConditions.length} penyakit.`}
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

      {filteredHealthConditions.length > 0 ? (
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {filteredHealthConditions.map((healthCondition) => (
            <StaggerItem key={healthCondition.id}>
              <HealthConditionCard healthCondition={healthCondition} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter."
            title="Penyakit tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
