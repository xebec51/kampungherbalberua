import type { Metadata } from "next";
import { SuggestionForm } from "@/components/forms/SuggestionForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kotak Saran",
  description:
    "Antarmuka kotak saran Kampung Herbal Berua tanpa penyimpanan database pada tahap pertama.",
  path: "/kotak-saran",
});

export default function SuggestionPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container className="max-w-4xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Formulir ini membantu menyiapkan alur aspirasi warga. Pada tahap pertama, data belum disimpan ke database dan tidak dikirim ke API eksternal."
            eyebrow="Kotak Saran"
            title="Sampaikan aspirasi untuk Kampung Herbal"
          />
          <StatusBadge tone="brown">Penyimpanan belum aktif</StatusBadge>
        </div>
        <SuggestionForm />
      </Container>
    </section>
  );
}
