import Link from "next/link";
import type { HealthZoneAdminRecord } from "@/lib/data/admin/health-zones";
import {
  createHealthZoneQrSvg,
  getHealthZoneQrTarget,
} from "@/lib/qr/health-zone-qr";

type HealthZoneQrPanelProps = {
  zone: HealthZoneAdminRecord;
};

export async function HealthZoneQrPanel({ zone }: HealthZoneQrPanelProps) {
  const targetUrl = getHealthZoneQrTarget(zone.zone_code);
  const svg = await createHealthZoneQrSvg(zone.zone_code);

  return (
    <section className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <div className="grid gap-5 lg:grid-cols-[14rem_1fr] lg:items-start">
        <div
          aria-label={`Pratinjau QR untuk ${zone.zone_code}`}
          className="overflow-hidden rounded-md border border-herbal-green/15 bg-white p-3"
          dangerouslySetInnerHTML={{ __html: svg }}
          role="img"
        />
        <div>
          <h2 className="text-lg font-bold text-herbal-ink">QR permanen zona</h2>
          <dl className="mt-4 grid gap-3 text-sm leading-6">
            <div>
              <dt className="font-semibold text-herbal-ink">Kode zona</dt>
              <dd className="text-herbal-muted">{zone.zone_code}</dd>
            </div>
            <div>
              <dt className="font-semibold text-herbal-ink">Target URL</dt>
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
              href={`/admin/zona/${zone.id}/qr?format=svg`}
            >
              Unduh SVG
            </Link>
            <Link
              className="inline-flex min-h-10 items-center justify-center rounded-md border border-herbal-green bg-white px-4 py-2 text-sm font-semibold text-herbal-green transition hover:bg-herbal-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-herbal-brown"
              href={`/admin/zona/${zone.id}/qr?format=png`}
            >
              Unduh PNG
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
