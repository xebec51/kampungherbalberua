"use client";

import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Product } from "@/types";
import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { FilterChip } from "@/components/ui/FilterChip";
import { SearchInput } from "@/components/ui/SearchInput";
import { getAvailabilityLabel } from "@/lib/formatters";

type ProductCatalogProps = {
  products: Product[];
};

const allCategoriesLabel = "Semua kategori";
const allAvailabilityLabel = "Semua ketersediaan";

const sortOptions = [
  { label: "Urutan asli", value: "default" },
  { label: "A-Z", value: "az" },
  { label: "Z-A", value: "za" },
  { label: "Harga termurah", value: "harga-asc" },
  { label: "Harga termahal", value: "harga-desc" },
  { label: "Unggulan dulu", value: "unggulan" },
];

const allowedSorts = new Set(sortOptions.map((option) => option.value));

function normalize(value: string) {
  return value.toLowerCase().trim();
}

export function ProductCatalog({ products }: ProductCatalogProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams.toString();
  const query = searchParams.get("q") ?? "";
  const category = searchParams.get("kategori") ?? "";
  const availability = searchParams.get("ketersediaan") ?? "";
  const sort = allowedSorts.has(searchParams.get("urut") ?? "")
    ? searchParams.get("urut") ?? "default"
    : "default";
  const [queryInput, setQueryInput] = useState(query);
  const deferredQueryInput = useDeferredValue(queryInput);
  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.category))).sort(
        (a, b) => a.localeCompare(b, "id"),
      ),
    [products],
  );
  const availabilities = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.availability)),
      ).sort((a, b) => a.localeCompare(b, "id")),
    [products],
  );
  const availabilityLabels = useMemo(() => {
    const labels = new Map<string, string>();

    for (const item of availabilities) {
      labels.set(item, getAvailabilityLabel(item));
    }

    return labels;
  }, [availabilities]);

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

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalize(deferredQueryInput);

    return products
      .filter((product) => {
        const matchesCategory = !category || product.category === category;
        const matchesAvailability =
          !availability || product.availability === availability;
        const searchableText = [
          product.name,
          product.description,
          product.category,
          product.producerName,
        ]
          .join(" ")
          .toLowerCase();

        return (
          matchesCategory &&
          matchesAvailability &&
          searchableText.includes(normalizedQuery)
        );
      })
      .sort((a, b) => {
        if (sort === "default") return 0;
        if (sort === "za") return b.name.localeCompare(a.name, "id");
        if (sort === "harga-asc") {
          const priceA = a.price ?? Number.POSITIVE_INFINITY;
          const priceB = b.price ?? Number.POSITIVE_INFINITY;
          return priceA - priceB;
        }
        if (sort === "harga-desc") {
          const priceA = a.price ?? Number.NEGATIVE_INFINITY;
          const priceB = b.price ?? Number.NEGATIVE_INFINITY;
          return priceB - priceA;
        }
        if (sort === "unggulan") {
          const featuredDiff = Number(b.featured) - Number(a.featured);
          if (featuredDiff !== 0) return featuredDiff;
          return a.name.localeCompare(b.name, "id");
        }
        return a.name.localeCompare(b.name, "id");
      });
  }, [availability, category, deferredQueryInput, products, sort]);

  function resetFilters() {
    setQueryInput("");
    router.replace(pathname, { scroll: false });
  }

  const activeFilters = [
    deferredQueryInput
      ? { key: "q", label: `Cari: ${deferredQueryInput}` }
      : null,
    category ? { key: "kategori", label: `Kategori: ${category}` } : null,
    availability
      ? {
          key: "ketersediaan",
          label: `Ketersediaan: ${
            availabilityLabels.get(availability) ?? availability
          }`,
        }
      : null,
  ].filter((item): item is { key: string; label: string } => Boolean(item));

  return (
    <div className="mt-8">
      <div className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(15rem,1fr)_180px_170px_170px_auto] lg:items-end">
          <SearchInput
            id="product-search"
            label="Cari produk"
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Contoh: teh herbal, jahe, bibit"
            value={queryInput}
          />
          <div>
            <label
              className="block text-sm font-medium text-herbal-ink"
              htmlFor="product-category"
            >
              Filter kategori
            </label>
            <select
              className="mt-2 h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              id="product-category"
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
            Filter ketersediaan
            <select
              className="h-11 w-full rounded-md border border-herbal-green/20 bg-white px-3 text-sm text-herbal-ink outline-none transition focus:border-herbal-green focus:ring-2 focus:ring-herbal-green/20"
              onChange={(event) =>
                updateParam("ketersediaan", event.target.value)
              }
              value={availability}
            >
              <option value="">{allAvailabilityLabel}</option>
              {availabilities.map((item) => (
                <option key={item} value={item}>
                  {getAvailabilityLabel(item)}
                </option>
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
          Menampilkan {filteredProducts.length} dari {products.length} produk.
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

      {filteredProducts.length > 0 ? (
        <div
          className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3"
          data-product-grid
        >
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="Coba gunakan kata kunci lain atau reset filter kategori/ketersediaan."
            title="Produk tidak ditemukan"
          />
        </div>
      )}
    </div>
  );
}
