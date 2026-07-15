import { ActivityCard } from "@/components/programs/ActivityCard";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredActivities } from "@/data/activities";

export function LatestActivitiesSection() {
  return (
    <section className="bg-herbal-cream py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Dokumentasi asli, foto, dan tanggal kegiatan akan diperbarui menggunakan arsip lapangan."
            eyebrow="Kegiatan Terbaru"
            title="Ruang dokumentasi KKN dan Kampung Herbal"
          />
          <LinkButton href="/kegiatan" variant="secondary">
            Lihat Kegiatan
          </LinkButton>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredActivities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </div>
      </Container>
    </section>
  );
}
