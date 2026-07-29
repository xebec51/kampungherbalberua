import { Container } from "@/components/ui/Container";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function MapPreviewSection() {
  return (
    <section className="home-section bg-herbal-cream py-16">
      <Container className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <ImagePlaceholder
          className="aspect-[16/10]"
          label="Gambar sementara pratinjau peta Kampung Herbal"
          variant="map"
        />
        <div>
          <StatusBadge tone="green">
            Pemetaan sedang disusun bersama tim Perencanaan Wilayah dan Kota
          </StatusBadge>
          <SectionHeading
            description="Halaman peta disiapkan untuk menerima denah, koordinat, dan lapisan informasi wilayah tanpa menampilkan data pribadi warga."
            title="Pratinjau peta Kampung Herbal"
          />
          <div className="mt-6">
            <LinkButton href="/peta" variant="secondary">
              Lihat Rencana Peta
            </LinkButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
