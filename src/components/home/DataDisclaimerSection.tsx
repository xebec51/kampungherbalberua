import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function DataDisclaimerSection() {
  return (
    <section className="bg-white py-10">
      <Container>
        <Disclaimer>
          Sebagian informasi masih dalam tahap pendataan dan verifikasi lapangan.
          Informasi tanaman dan ramuan disediakan untuk edukasi mengenai
          pemanfaatan tradisional, bukan diagnosis, resep, atau pengganti
          konsultasi dengan dokter, apoteker, maupun tenaga kesehatan lainnya.
        </Disclaimer>
      </Container>
    </section>
  );
}
