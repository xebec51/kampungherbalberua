import type { Metadata } from "next";
import { markSuggestionDoneAction } from "@/app/admin/(protected)/kotak-saran/actions";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { SelectField, TextField } from "@/components/admin/fields";
import { AdminToneBadge as StatusBadge } from "@/components/admin/AdminStatusBadge";
import { StaticPageQrPanel } from "@/components/admin/StaticPageQrPanel";
import { getAllSuggestionsForAdmin } from "@/lib/data/admin/suggestions";
import { createPageMetadata } from "@/lib/metadata";
import { paginateItems, parsePageParam } from "@/lib/pagination";
import {
  createSuggestionBoxQrSvg,
  getSuggestionBoxQrTarget,
} from "@/lib/qr/health-zone-qr";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Kotak Saran",
  description: "Daftar saran dan aspirasi warga Kampung Herbal Berua.",
  path: "/admin/kotak-saran",
});

type AdminSuggestionsPageProps = {
  searchParams: Promise<{
    halaman?: string;
    kategori?: string;
    q?: string;
    status?: string;
  }>;
};

const ADMIN_SUGGESTIONS_PAGE_SIZE = 8;

function parseSuggestionStatus(value?: string) {
  return value === "baru" || value === "selesai" ? value : "";
}

export default async function AdminSuggestionsPage({
  searchParams,
}: AdminSuggestionsPageProps) {
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const category = params.kategori?.trim() ?? "";
  const status = parseSuggestionStatus(params.status);
  const result = await getAllSuggestionsForAdmin();
  const suggestions = result.data ?? [];
  const newCount = suggestions.filter((item) => item.status !== "selesai").length;
  const categories = Array.from(
    new Set(suggestions.map((suggestion) => suggestion.category)),
  ).sort((left, right) => left.localeCompare(right, "id"));
  const normalizedQuery = query.toLowerCase();
  const filteredSuggestions = suggestions.filter((suggestion) => {
    const matchesCategory = !category || suggestion.category === category;
    const matchesStatus =
      !status ||
      (status === "selesai"
        ? suggestion.status === "selesai"
        : suggestion.status !== "selesai");
    const searchableText = [
      suggestion.title,
      suggestion.content,
      suggestion.category,
      suggestion.location ?? "",
      suggestion.is_anonymous ? "Anonim" : suggestion.submitter_name ?? "",
    ]
      .join(" ")
      .toLowerCase();

    return (
      matchesCategory &&
      matchesStatus &&
      searchableText.includes(normalizedQuery)
    );
  });
  const pagination = paginateItems(
    filteredSuggestions,
    parsePageParam(params.halaman),
    ADMIN_SUGGESTIONS_PAGE_SIZE,
  );
  const pageSuggestions = pagination.items;
  const activeFilterCount = [query, category, status].filter(Boolean).length;
  const resultSummary = result.error
    ? "Filter kotak saran belum dapat dimuat."
    : pagination.totalItems > 0
      ? `Menampilkan ${pagination.startItem}-${pagination.endItem} dari ${pagination.totalItems} saran.`
      : "Tidak ada saran yang cocok dengan filter.";
  const suggestionBoxQrTarget = getSuggestionBoxQrTarget();
  const suggestionBoxQrSvg = await createSuggestionBoxQrSvg();

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={<StatusBadge tone="green">{newCount} belum ditindaklanjuti</StatusBadge>}
        description="Saran warga yang dikirim lewat formulir publik /kotak-saran. Data ini hanya dapat dibaca oleh admin."
        eyebrow="Admin"
        title="Kotak Saran"
      />

      <StaticPageQrPanel
        destinationHref="/kotak-saran"
        destinationLabel="Buka halaman tujuan"
        downloadBaseHref="/admin/kotak-saran/qr"
        heading="QR permanen kotak saran"
        previewLabel="Pratinjau QR untuk kotak saran"
        svg={suggestionBoxQrSvg}
        targetUrl={suggestionBoxQrTarget}
      />

      <AdminFilterBar
        activeCount={activeFilterCount}
        resetHref="/admin/kotak-saran"
        resultSummary={resultSummary}
        title="Atur filter kotak saran"
      >
        <TextField
          className="lg:w-72"
          defaultValue={query}
          label="Cari saran"
          name="q"
          type="search"
        />
        <SelectField
          className="lg:w-48"
          defaultValue={category}
          label="Kategori"
          name="kategori"
          options={[
            { label: "Semua", value: "" },
            ...categories.map((item) => ({ label: item, value: item })),
          ]}
        />
        <SelectField
          className="lg:w-48"
          defaultValue={status}
          label="Status"
          name="status"
          options={[
            { label: "Semua", value: "" },
            { label: "Baru", value: "baru" },
            { label: "Selesai", value: "selesai" },
          ]}
        />
      </AdminFilterBar>

      {result.error ? (
        <AdminEmptyState
          description={result.error}
          title="Daftar saran belum dapat dimuat"
        />
      ) : pageSuggestions.length === 0 ? (
        <AdminEmptyState
          description="Coba ubah kata kunci, kategori, atau status."
          title="Belum ada saran yang cocok"
        />
      ) : (
        <div className="grid gap-4">
          {pageSuggestions.map((suggestion) => (
            <article
              className="grid gap-3 rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-5 shadow-[var(--shadow-soft)]"
              key={suggestion.id}
            >
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone="brown">{suggestion.category}</StatusBadge>
                <StatusBadge tone={suggestion.status === "selesai" ? "green" : "neutral"}>
                  {suggestion.status === "selesai" ? "Selesai" : "Baru"}
                </StatusBadge>
                <span className="text-xs font-semibold text-herbal-muted">
                  {new Date(suggestion.created_at).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              </div>
              <h3 className="text-lg font-bold text-herbal-ink">{suggestion.title}</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-herbal-muted">
                {suggestion.content}
              </p>
              <dl className="grid gap-1 text-xs leading-5 text-herbal-muted sm:grid-cols-3">
                <div>
                  <dt className="font-semibold text-herbal-brown">Lokasi</dt>
                  <dd>{suggestion.location ?? "-"}</dd>
                </div>
                <div>
                  <dt className="font-semibold text-herbal-brown">Pengirim</dt>
                  <dd>
                    {suggestion.is_anonymous
                      ? "Anonim"
                      : suggestion.submitter_name ?? "-"}
                  </dd>
                </div>
                <div>
                  <dt className="font-semibold text-herbal-brown">Kontak</dt>
                  <dd>
                    {suggestion.is_anonymous
                      ? "-"
                      : suggestion.submitter_contact ?? "-"}
                  </dd>
                </div>
              </dl>
              {suggestion.status !== "selesai" ? (
                <form action={markSuggestionDoneAction}>
                  <input name="id" type="hidden" value={suggestion.id} />
                  <button
                    className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
                    type="submit"
                  >
                    Tandai selesai
                  </button>
                </form>
              ) : null}
            </article>
          ))}
        </div>
      )}
      {!result.error ? (
        <AdminPagination
          currentPage={pagination.currentPage}
          endItem={pagination.endItem}
          params={{ kategori: category, q: query, status }}
          pathname="/admin/kotak-saran"
          startItem={pagination.startItem}
          totalItems={pagination.totalItems}
          totalPages={pagination.totalPages}
        />
      ) : null}
    </div>
  );
}
