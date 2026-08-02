import type { Metadata } from "next";
import { markSuggestionDoneAction } from "@/app/admin/(protected)/kotak-saran/actions";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAllSuggestionsForAdmin } from "@/lib/data/admin/suggestions";
import { createPageMetadata } from "@/lib/metadata";

export const dynamic = "force-dynamic";

export const metadata: Metadata = createPageMetadata({
  title: "Kotak Saran",
  description: "Daftar saran dan aspirasi warga Kampung Herbal Berua.",
  path: "/admin/kotak-saran",
});

export default async function AdminSuggestionsPage() {
  const result = await getAllSuggestionsForAdmin();
  const suggestions = result.data ?? [];
  const newCount = suggestions.filter((item) => item.status !== "selesai").length;

  return (
    <div className="grid gap-6">
      <AdminPageHeader
        actions={<StatusBadge tone="green">{newCount} belum ditindaklanjuti</StatusBadge>}
        description="Saran warga yang dikirim lewat formulir publik /kotak-saran. Data ini hanya dapat dibaca oleh admin."
        eyebrow="Admin"
        title="Kotak Saran"
      />

      {result.error ? (
        <section className="rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-5 text-sm leading-6 text-herbal-brown shadow-sm">
          <h3 className="text-base font-bold">Daftar saran belum dapat dimuat</h3>
          <p className="mt-2">{result.error}</p>
        </section>
      ) : suggestions.length === 0 ? (
        <section className="rounded-[var(--radius-card)] border border-herbal-green/10 bg-white p-6 text-sm leading-6 text-herbal-muted shadow-[var(--shadow-soft)]">
          Belum ada saran yang masuk.
        </section>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
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
    </div>
  );
}
