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
import type { Activity } from "@/types";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { ActivityCard } from "@/components/programs/ActivityCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { FilterDialog } from "@/components/ui/FilterDialog";
import { SearchInput } from "@/components/ui/SearchInput";

type ActivityCatalogProps = {
  activities: Activity[];
};

const allCategoriesLabel = "Semua kategori";

const sortOptions = [
  { label: "Urutan asli", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function ActivityCatalog({ activities }: ActivityCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const paramsRef = useRef(searchParamsString);
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("kategori") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "default"
    : "default";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);
  const categories = useMemo(
    () =>
      Array.from(
        new Set(activities.map((activity) => activity.category)),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [activities],
  );

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

  const filteredActivities = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return activities
      .filter((activity) => {
        const matchesCategory = !category || activity.category === category;
        const searchableText = [
          activity.title,
          activity.description,
          activity.category,
          activity.dateLabel,
        ]
          .join(" ")
          .toLowerCase();

        return matchesCategory && searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "default") return 0;
        if (sort === "za") return b.title.localeCompare(a.title, "id");
        return a.title.localeCompare(b.title, "id");
      });
  }, [activities, category, deferredQueryInput, sort]);

  function resetFilters() {
    setQueryInput("");
    paramsRef.current = "";
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    category ? { key: "kategori", label: `Kategori: ${category}` } : null,
    sort !== "default"
      ? {
          key: "urut",
          label: `Urutan: ${
            sortOptions.find((option) => option.value === sort)?.label ?? sort
          }`,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <div className="mt-5">
      <FilterDialog
        activeCount={activeFilters.length}
        onReset={resetFilters}
        resultSummary={`Menampilkan ${filteredActivities.length} dari ${activities.length} kegiatan.`}
        title="Atur filter kegiatan"
      >
        <div className="sm:col-span-2">
          <SearchInput
            id="activity-search"
            label="Cari kegiatan"
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Contoh: penanaman, edukasi, gotong royong"
            value={queryInput}
          />
        </div>
        <div>
          <label
            className="block text-sm font-medium text-herbal-ink"
            htmlFor="activity-category"
          >
            Filter kategori
          </label>
          <select
            className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
            id="activity-category"
            onChange={(event) => updateParam("kategori", event.target.value)}
            value={category}
          >
            <option value="">{allCategoriesLabel}</option>
            {categories.map((item) => (
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
                updateParam(filter.key, "");
              }}
            >
              {filter.label} - hapus
            </FilterChip>
          ))}
        </div>
      ) : null}

      {filteredActivities.length > 0 ? (
        <StaggerGroup className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
          {filteredActivities.map((activity) => (
            <StaggerItem key={activity.id}>
              <ActivityCard activity={activity} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter kategori."
            title="Kegiatan tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
