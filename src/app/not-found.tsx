import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";

export default function NotFound() {
  return (
    <section className="bg-herbal-cream py-16 sm:py-24">
      <Container className="max-w-3xl text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
          Halaman tidak ditemukan
        </p>
        <h1 className="mt-4 text-4xl font-bold text-herbal-ink sm:text-5xl">
          Data yang dicari belum tersedia
        </h1>
        <p className="mt-5 text-base leading-8 text-herbal-muted">
          Halaman mungkin belum dibuat, slug tidak valid, atau data masih dalam
          proses pendataan lapangan.
        </p>
        <div className="mt-8 flex justify-center">
          <LinkButton href="/">Kembali ke Beranda</LinkButton>
        </div>
      </Container>
    </section>
  );
}
