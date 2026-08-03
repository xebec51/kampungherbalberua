import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/Reveal";
import { ActivityCatalog } from "@/components/programs/ActivityCatalog";
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
    <section className="bg-herbal-cream py-8 sm:py-10">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Dokumentasi"
            title="Kegiatan KKN dan Kampung Herbal"
          />
        </Reveal>
        {activities.length > 0 ? (
          <Suspense
            fallback={
              <p className="mt-5 text-sm text-herbal-muted">
                Memuat katalog kegiatan.
              </p>
            }
          >
            <ActivityCatalog activities={activities} />
          </Suspense>
        ) : null}
      </Container>
    </section>
  );
}
