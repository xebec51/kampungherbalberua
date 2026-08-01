import Link from "next/link";
import { CopyQrUrlButton } from "@/components/admin/CopyQrUrlButton";
import type { PlantAdminRecord } from "@/lib/data/admin/plants";
import { createPlantQrSvg, getPlantQrTarget } from "@/lib/qr/health-zone-qr";

type PlantQrPanelProps = {
  plant: PlantAdminRecord;
};

export async function PlantQrPanel({ plant }: PlantQrPanelProps) {
  const targetUrl = getPlantQrTarget(plant.qr_key);
  const svg = await createPlantQrSvg(plant.qr_key);

  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[14rem_1fr] lg:items-start">
        <div
          aria-label={`Pratinjau QR untuk ${plant.local_name}`}
          className="overflow-hidden rounded-md border border-herbal-green/15 bg-white p-3"
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
        <div>
          <h2 className="text-lg font-bold text-herbal-ink">QR permanen tanaman</h2>
          <dl className="mt-4 grid gap-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-herbal-ink">Kunci QR publik</dt>
              <dd className="text-herbal-muted">{plant.qr_key}</dd>
            </div>
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
              href={`/admin/tanaman/${plant.id}/qr?format=svg`}
            >
              Unduh QR SVG
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={`/admin/tanaman/${plant.id}/qr?format=png`}
            >
              Unduh QR PNG
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={`/tanaman/${plant.slug}`}
            >
              Buka halaman tujuan
            </Link>
            <CopyQrUrlButton url={targetUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
