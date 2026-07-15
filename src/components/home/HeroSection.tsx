import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function HeroSection() {
  return (
    <section className="bg-herbal-cream">
      <Container className="grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <div className="min-w-0">
          <StatusBadge tone="green">RT 009/RW 006 Kelurahan Berua</StatusBadge>
          <h1 className="mt-6 max-w-4xl break-words text-3xl font-bold tracking-normal text-herbal-ink sm:text-5xl lg:text-6xl">
            Mengenal Tanaman, Merawat Kesehatan, Memberdayakan Warga
          </h1>
          <p className="mt-6 max-w-2xl break-words text-lg leading-8 text-herbal-muted">
            Portal informasi digital Kampung Herbal RT 009/RW 006 Kelurahan
            Berua yang menghubungkan pengetahuan tanaman obat, ramuan sehat,
            potensi wilayah, dan produk masyarakat.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <LinkButton href="/tanaman">Jelajahi Tanaman</LinkButton>
            <LinkButton href="/peta" variant="secondary">
              Lihat Peta Kampung
            </LinkButton>
          </div>
        </div>
        <div className="min-w-0 rounded-md border border-herbal-green/15 bg-herbal-soft p-6 shadow-sm sm:aspect-[4/3]">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-herbal-brown">
                Ilustrasi placeholder
              </p>
              <p className="mt-3 max-w-sm break-words text-xl font-bold text-herbal-deep sm:text-2xl">
                Ruang digital untuk tanaman, peta, produk, dan aspirasi warga.
              </p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-3 sm:mt-0">
              {["TOGA", "Peta", "Produk"].map((item) => (
                <span
                  className="rounded-md bg-white px-3 py-4 text-center text-sm font-semibold text-herbal-green shadow-sm"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
