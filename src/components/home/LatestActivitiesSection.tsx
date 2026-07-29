import { ActivityCard } from "@/components/programs/ActivityCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredActivities } from "@/data/activities";

export function LatestActivitiesSection() {
  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
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
        <AutoCarousel
          ariaLabel="Carousel kegiatan terbaru"
          className="mt-8"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[30%] xl:basis-[23%] xl:max-w-[18rem]"
        >
          {featuredActivities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
