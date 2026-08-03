import { Reveal } from "@/components/motion/Reveal";
import { ActivityCard } from "@/components/programs/ActivityCard";
import { AutoCarousel } from "@/components/ui/AutoCarousel";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredActivities } from "@/data/activities";

export function LatestActivitiesSection() {
  if (featuredActivities.length === 0) {
    return null;
  }

  return (
    <section className="home-section bg-herbal-cream py-14 sm:py-16">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              description="Dokumentasi kegiatan yang telah siap dipublikasikan ditampilkan pada bagian ini."
              eyebrow="Kegiatan Terbaru"
              title="Ruang dokumentasi KKN dan Kampung Herbal"
            />
            <LinkButton href="/kegiatan" variant="secondary">
              Lihat Kegiatan
            </LinkButton>
          </div>
        </Reveal>
        <AutoCarousel
          ariaLabel="Carousel kegiatan terbaru"
          className="mt-8"
          itemClassName="basis-[82%] sm:basis-[46%] lg:basis-[24%] xl:basis-[19%]"
        >
          {featuredActivities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </AutoCarousel>
      </Container>
    </section>
  );
}
