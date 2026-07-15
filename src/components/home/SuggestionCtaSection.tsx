import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function SuggestionCtaSection() {
  return (
    <section className="bg-herbal-deep py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <SectionHeading
          description={
            <span className="text-white/80">
              Kotak saran disiapkan sebagai antarmuka awal. Penyimpanan database
              belum aktif pada tahap pertama, sehingga pengguna akan diberi
              pemberitahuan yang jelas saat mengirim formulir.
            </span>
          }
          eyebrow="Aspirasi Warga"
          title="Bantu lengkapi kebutuhan Kampung Herbal"
        />
        <LinkButton
          className="bg-white text-herbal-deep hover:bg-herbal-soft"
          href="/kotak-saran"
        >
          Buka Kotak Saran
        </LinkButton>
      </Container>
    </section>
  );
}
