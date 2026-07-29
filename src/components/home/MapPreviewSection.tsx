import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHerbaCodeZoneSummaries } from "@/lib/data/herbacode";

export async function MapPreviewSection() {
  const zones = await getHerbaCodeZoneSummaries();

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
              </li>
            ))}
          </ul>
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
