import { CommunityMapPlaceholder } from "@/components/maps/CommunityMapPlaceholder";
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
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.72fr)] lg:items-center">
          <CommunityMapPlaceholder compact />
          <div>
            <SectionHeading
              description="Halaman peta menyediakan akses ke jalan tematik dan zona kesehatan Kampung Herbal Berua tanpa menampilkan titik rumah atau data pribadi warga."
              eyebrow="Pemetaan"
              title="Peta Kampung Herbal"
            />
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-md border border-herbal-green/10 bg-white p-4 shadow-sm">
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
                  Jalan tematik
                </dt>
                <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
                  {streets.length}
                </dd>
              </div>
              <div className="rounded-md border border-herbal-brown/20 bg-white p-4 shadow-sm">
                <dt className="text-xs font-bold uppercase tracking-[0.14em] text-herbal-brown">
                  Zona kesehatan
                </dt>
                <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
                  {zones.length}
                </dd>
              </div>
            </dl>
            <div className="mt-7">
              <LinkButton href="/peta" variant="secondary">
                Lihat Peta Kampung
              </LinkButton>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
