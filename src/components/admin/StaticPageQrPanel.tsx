import Link from "next/link";
import { CopyQrUrlButton } from "@/components/admin/CopyQrUrlButton";

type StaticPageQrPanelProps = {
  destinationHref: string;
  destinationLabel: string;
  downloadBaseHref: string;
  heading: string;
  previewLabel: string;
  svg: string;
  targetUrl: string;
};

export function StaticPageQrPanel({
  destinationHref,
  destinationLabel,
  downloadBaseHref,
  heading,
  previewLabel,
  svg,
  targetUrl,
}: StaticPageQrPanelProps) {
  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[14rem_1fr] lg:items-start">
        <div
          aria-label={previewLabel}
          className="overflow-hidden rounded-md border border-herbal-green/15 bg-white p-3"
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
        <div>
          <h2 className="text-lg font-bold text-herbal-ink">{heading}</h2>
          <dl className="mt-4 grid gap-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-herbal-ink">URL QR permanen</dt>
              <dd className="break-words text-herbal-muted">{targetUrl}</dd>
            </div>
          </dl>
          <p className="mt-4 rounded-md border border-herbal-brown/20 bg-[#F5E9DF] p-3 text-sm leading-6 text-herbal-brown">
            Pastikan URL tujuan sudah menggunakan domain produksi sebelum QR
            dicetak dan dipasang.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md bg-herbal-green px-4 py-2 text-sm font-semibold text-white transition hover:bg-herbal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={`${downloadBaseHref}?format=svg`}
            >
              Unduh QR SVG
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={`${downloadBaseHref}?format=png`}
            >
              Unduh QR PNG
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={destinationHref}
            >
              {destinationLabel}
            </Link>
            <CopyQrUrlButton url={targetUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
