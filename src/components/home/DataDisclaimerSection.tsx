import { Container } from "@/components/ui/Container";
import { Disclaimer } from "@/components/ui/Disclaimer";
import { Reveal } from "@/components/motion/Reveal";

export function DataDisclaimerSection() {
  return (
    <section className="home-section bg-white py-10">
      <Container>
        <Reveal>
          <Disclaimer>
            Informasi tanaman dan ramuan disediakan untuk edukasi mengenai
            pemanfaatan tradisional, bukan diagnosis, resep, atau pengganti
            konsultasi dengan dokter, apoteker, maupun tenaga kesehatan
            lainnya. Ibu hamil, anak-anak, lansia, penderita penyakit
            tertentu, dan pengguna obat rutin perlu berkonsultasi dengan
            tenaga kesehatan.
          </Disclaimer>
        </Reveal>
      </Container>
    </section>
  );
}
