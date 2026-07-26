import { HealthZoneCard } from "@/components/zones/HealthZoneCard";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getFeaturedHealthZones } from "@/lib/data/health-zones";

export async function FeaturedHealthZonesSection() {
  const zones = await getFeaturedHealthZones(3);

  return (
    <section className="bg-herbal-cream py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Kampung Herbal Harmony membagi kawasan menjadi zona tematik untuk edukasi kebiasaan hidup sehat. Materi bersifat umum dan menunggu verifikasi tenaga kesehatan."
            eyebrow="Zona Kesehatan"
            title="Jelajahi Zona Kesehatan"
          />
          <LinkButton href="/zona-kesehatan" variant="secondary">
            Lihat Semua Zona
          </LinkButton>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {zones.map((zone) => (
            <HealthZoneCard key={zone.zoneCode} zone={zone} />
          ))}
        </div>
      </Container>
    </section>
  );
}
