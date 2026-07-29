import { StreetCard } from "@/components/streets/StreetCard";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";
import { getPublishedStreets } from "@/lib/data/streets";

export async function MapPreviewSection() {
  const [zones, streets] = await Promise.all([
    getHerbaCodeZoneSummaries(),
    getPublishedStreets(),
  ]);

  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
          <SectionHeading
            description="Halaman peta menampilkan daftar zona HerbaCode dan jalan tematik tanpa titik rumah, koordinat warga, atau data kesehatan perorangan."
            eyebrow="Pemetaan"
            title="Zona dan Jalan Kampung Herbal"
          />
          <dl className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-herbal-green/10 bg-white p-4 shadow-sm">
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
                Zona HerbaCode
              </dt>
              <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
                {zones.length}
              </dd>
            </div>
            <div className="rounded-md border border-herbal-brown/20 bg-white p-4 shadow-sm">
              <dt className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
                Jalan tematik
              </dt>
              <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
                {streets.length}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <section>
            <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
              Zona HerbaCode
            </h3>
            <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2">
              {zones.map((zone) => (
                <li
                  className="min-h-28 rounded-md border border-herbal-green/10 bg-white p-4 text-sm font-semibold text-herbal-ink shadow-sm"
                  key={zone.zoneCode}
                >
                  {zone.title}
                  {zone.streetNames.length > 0 ? (
                    <span className="mt-1 block text-xs font-semibold text-herbal-green">
                      {zone.streetNames.join(", ")}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
          {streets.length > 0 ? (
            <section>
              <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-herbal-brown">
                Jalan tematik
              </h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {streets.map((street) => (
                  <StreetCard compact key={street.slug} street={street} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <div className="mt-7">
          <LinkButton href="/peta" variant="secondary">
            Lihat Peta dan Jalan
          </LinkButton>
        </div>
      </Container>
    </section>
  );
}
