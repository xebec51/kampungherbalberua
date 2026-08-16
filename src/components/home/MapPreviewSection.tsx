import { CommunityMapPlaceholder } from "@/components/maps/CommunityMapPlaceholder";
import { InteractiveMap } from "@/components/maps/InteractiveMap";
import { MapLocationCard } from "@/components/maps/MapLocationCard";
import { Reveal } from "@/components/motion/Reveal";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function MapPreviewSection() {
  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-start">
          <div className="grid gap-6">
            <CommunityMapPlaceholder compact />
            <InteractiveMap />
          </div>
          <div>
            <Reveal>
              <SectionHeading
                description="Denah kompleks, peta interaktif, dan lokasi Google Maps Kampung Herbal Berua tanpa menampilkan titik rumah atau data pribadi warga."
                eyebrow="Pemetaan"
                title="Peta Kampung Herbal"
              />
            </Reveal>
            <div className="mt-6">
              <MapLocationCard />
            </div>
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
