import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function HerbaCodeSection() {
  return (
    <section className="home-section bg-herbal-soft py-16">
      <Container className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <SectionHeading
          description="HerbaCode menghubungkan setiap tanaman TOGA dengan halaman informasi digital melalui QR Code. Pemasangan QR Code akan dilakukan setelah data tanaman selesai diverifikasi dan website dipublikasikan."
          eyebrow="HerbaCode"
          title="QR Code tanaman disiapkan setelah data tervalidasi"
        />
        <div className="rounded-md border border-herbal-green/15 bg-white p-6 shadow-sm">
          <div className="mx-auto grid aspect-square max-w-64 grid-cols-5 gap-2 rounded-md bg-herbal-cream p-4">
            {Array.from({ length: 25 }).map((_, index) => (
              <span
                className={
                  index % 3 === 0 || index === 6 || index === 18
                    ? "rounded-sm bg-herbal-green"
                    : "rounded-sm bg-white"
                }
                key={index}
              />
            ))}
          </div>
          <div className="mt-5 flex justify-center">
            <StatusBadge tone="brown">QR Code segera tersedia</StatusBadge>
          </div>
        </div>
      </Container>
    </section>
  );
}
