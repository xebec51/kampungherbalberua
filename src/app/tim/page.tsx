import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { teamMembers } from "@/data/team";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Tim KKN",
  description:
    "Informasi tim KKN Kampung Herbal Berua tanpa menampilkan nomor telepon atau data pribadi sensitif.",
  path: "/tim",
});

export default function TeamPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container>
        <SectionHeading
          description="Kontribusi setiap bidang akan diintegrasikan bertahap berdasarkan hasil program kerja. Halaman ini tidak menampilkan NIM, nomor telepon, alamat, atau data pribadi lainnya."
          eyebrow="Tim KKN"
          title="Kolaborasi lintas bidang"
        />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <article
              className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm"
              key={member.id}
            >
              <StatusBadge tone="green">{member.studyProgram}</StatusBadge>
              <h2 className="mt-4 text-xl font-bold text-herbal-ink">
                {member.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-herbal-muted">
                {member.contribution}
              </p>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
