import type { Metadata } from "next";
import { SuggestionForm } from "@/components/forms/SuggestionForm";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kotak Saran",
  description: "Kirim saran dan aspirasi warga untuk Kampung Herbal Berua.",
  path: "/kotak-saran",
});

export default function SuggestionPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container className="max-w-4xl">
        <SectionHeading
          description="Saran yang Anda kirim (kategori, judul, isi, dan lokasi bila diisi) hanya dapat dilihat oleh pengurus Kampung Herbal Berua. Nama dan kontak bersifat opsional — kosongkan atau centang Kirim secara anonim bila tidak ingin dicantumkan. Formulir ini tidak meminta data kesehatan pribadi."
          eyebrow="Kotak Saran"
          title="Sampaikan saran Anda"
        />
        <SuggestionForm />
      </Container>
    </section>
  );
}
