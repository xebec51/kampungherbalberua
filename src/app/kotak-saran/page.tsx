import type { Metadata } from "next";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Kotak Saran",
  description: "Informasi privasi kotak saran Kampung Herbal Berua.",
  path: "/kotak-saran",
});

export default function SuggestionPage() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16">
      <Container className="max-w-4xl">
        <SectionHeading
          description="Website ini tidak menyimpan isi saran, nama, kontak, alamat rumah, atau data kesehatan perorangan."
          eyebrow="Kotak Saran"
          title="Privasi saran warga"
        />
      </Container>
    </section>
  );
}
