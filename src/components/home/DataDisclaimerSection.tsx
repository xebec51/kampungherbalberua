import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function DataDisclaimerSection() {
  return (
    <section className="bg-white py-10">
      <Container>
        <Disclaimer>
          Sebagian data pada website ini masih berupa data demonstrasi dan akan
          diperbarui setelah proses pendataan lapangan selesai. Informasi tanaman
          dan ramuan disediakan untuk edukasi mengenai pemanfaatan tradisional,
          bukan diagnosis, resep, atau pengganti konsultasi dengan dokter,
          apoteker, maupun tenaga kesehatan lainnya.
        </Disclaimer>
      </Container>
    </section>
  );
}
