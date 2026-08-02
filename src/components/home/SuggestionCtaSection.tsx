import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { Reveal } from "@/components/motion/Reveal";

export function SuggestionCtaSection() {
  return (
    <section className="home-section bg-herbal-deep py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
        <Reveal>
          <div className="max-w-3xl">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#f7d774]">
              Aspirasi Warga
            </p>
            <h2 className="mt-3 text-2xl font-bold tracking-normal text-white sm:text-3xl">
              Bantu lengkapi kebutuhan Kampung Herbal
            </h2>
            <p className="mt-4 text-base leading-7 text-white/[0.86] sm:text-lg">
              Sampaikan saran, keluhan, atau ide untuk Kampung Herbal Berua.
              Saran Anda akan ditinjau langsung oleh pengurus RT/RW.
            </p>
          </div>
        </Reveal>
        <LinkButton
          className="min-w-52 bg-white !text-herbal-deep hover:bg-herbal-soft"
          href="/kotak-saran"
          variant="secondary"
        >
          Buka Kotak Saran
        </LinkButton>
      </Container>
    </section>
  );
}
