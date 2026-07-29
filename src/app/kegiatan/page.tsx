import type { Metadata } from "next";
import { ActivityCard } from "@/components/programs/ActivityCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { activities } from "@/data/activities";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kegiatan",
  description: "Dokumentasi kegiatan Kampung Herbal Berua.",
  path: "/kegiatan",
});

export default function ActivitiesPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Dokumentasi kegiatan yang telah memiliki data publik akan ditampilkan di halaman ini."
          eyebrow="Dokumentasi"
          title="Kegiatan KKN dan Kampung Herbal"
        />
        {activities.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {activities.map((activity) => (
              <ActivityCard activity={activity} key={activity.id} />
            ))}
          </div>
        ) : null}
      </Container>
    </section>
  );
}
