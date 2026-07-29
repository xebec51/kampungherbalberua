import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";

export function DataDisclaimerSection() {
  return (
    <section className="home-section bg-white py-10">
      <Container>
        <Disclaimer>
          Informasi tanaman dan ramuan disediakan untuk edukasi mengenai
          pemanfaatan tradisional, bukan diagnosis, resep, atau pengganti
          konsultasi dengan dokter, apoteker, maupun tenaga kesehatan lainnya.
          Ibu hamil, anak-anak, lansia, penderita penyakit tertentu, dan
          pengguna obat rutin perlu berkonsultasi dengan tenaga kesehatan.
        </Disclaimer>
      </Container>
    </section>
  );
}
