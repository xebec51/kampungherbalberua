"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Recipe, ValidationStatus } from "@/types";
import { RecipeCard } from "@/components/recipes/RecipeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchInput } from "@/components/ui/SearchInput";
import { getValidationStatusLabel } from "@/lib/formatters";

type RecipeCatalogProps = {
  recipes: Recipe[];
};

const allStatusLabel = "Semua status";

const sortOptions = [
  { label: "Urutan asli", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

const validationStatusValues: ValidationStatus[] = [
  "data-demonstrasi",
  "menunggu-verifikasi",
  "terverifikasi",
  "ditolak",
];
const allowedStatuses = new Set<string>(validationStatusValues);

function isValidationStatus(value: string): value is ValidationStatus {
  return allowedStatuses.has(value);
}

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function RecipeCatalog({ recipes }: RecipeCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const query = searchParams.get("q") ?? "";
  const rawStatus = searchParams.get("status") ?? "";
  const status = isValidationStatus(rawStatus) ? rawStatus : "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "default"
    : "default";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);
  const statusOptions = useMemo(
    () =>
      Array.from(
        new Set(recipes.map((recipe) => recipe.validationStatus)),
      ).sort((a, b) =>
        getValidationStatusLabel(a).localeCompare(
          getValidationStatusLabel(b),
          "id",
        ),
      ),
    [recipes],
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

  const filteredRecipes = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return recipes
      .filter((recipe) => {
        const matchesStatus =
          !status || recipe.validationStatus === status;
        const searchableText = [
          recipe.name,
          recipe.shortDescription,
          recipe.traditionalPurpose,
          ...recipe.ingredients.map((ingredient) => ingredient.name),
        ]
          .join(" ")
          .toLowerCase();

        return matchesStatus && searchableText.includes(normalizedQuery);
      })
      .sort((a, b) => {
        if (sort === "default") return 0;
        if (sort === "za") return b.name.localeCompare(a.name, "id");
        return a.name.localeCompare(b.name, "id");
      });
  }, [deferredQueryInput, recipes, sort, status]);

  function resetFilters() {
    setQueryInput("");
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    status
      ? {
          key: "status",
          label: `Status: ${getValidationStatusLabel(status)}`,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1fr)_200px_170px_auto] lg:items-end">
          <SearchInput
            id="recipe-search"
            label="Cari ramuan"
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Contoh: jahe, demam, pencernaan"
            value={queryInput}
          />
          <div>
            <label
              className="block text-sm font-medium text-herbal-ink"
              htmlFor="recipe-status"
            >
              Filter status verifikasi
            </label>
            <select
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="recipe-status"
              onChange={(event) => updateParam("status", event.target.value)}
              value={status}
            >
              <option value="">{allStatusLabel}</option>
              {statusOptions.map((item) => (
                <option key={item} value={item}>
                  {getValidationStatusLabel(item)}
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
          Menampilkan {filteredRecipes.length} dari {recipes.length} ramuan.
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

      {filteredRecipes.length > 0 ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter status verifikasi."
            title="Ramuan tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
