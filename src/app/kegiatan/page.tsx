import type { Metadata } from "next";
import { ActivityCard } from "@/components/programs/ActivityCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { activities } from "@/data/activities";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kegiatan",
  description:
    "Dokumentasi kegiatan demonstrasi Kampung Herbal Berua yang akan diperbarui dengan arsip lapangan.",
  path: "/kegiatan",
});

export default function ActivitiesPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Kartu kegiatan saat ini menampilkan data demonstrasi. Foto dan tanggal akan diperbarui menggunakan dokumentasi lapangan."
            eyebrow="Dokumentasi"
            title="Kegiatan KKN dan Kampung Herbal"
          />
          <StatusBadge tone="brown">Foto dan tanggal akan diperbarui</StatusBadge>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {activities.map((activity) => (
            <ActivityCard activity={activity} key={activity.id} />
          ))}
        </div>
      </Container>
    </section>
  );
}
