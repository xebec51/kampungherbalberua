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
    <section className="home-section bg-herbal-cream py-16">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeading
          description="Halaman peta menampilkan daftar zona HerbaCode tanpa titik rumah, koordinat warga, atau data kesehatan perorangan."
          eyebrow="Pemetaan"
          title="Zona Kampung Herbal"
        />
        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {zones.slice(0, 6).map((zone) => (
              <li
                className="rounded-md border border-herbal-green/10 bg-white p-4 text-sm font-semibold text-herbal-ink shadow-sm"
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
          {streets.length > 0 ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {streets.slice(0, 4).map((street) => (
                <StreetCard key={street.slug} street={street} />
              ))}
            </div>
          ) : null}
          <div className="mt-6">
            <LinkButton href="/peta" variant="secondary">
              Lihat Daftar Zona
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
