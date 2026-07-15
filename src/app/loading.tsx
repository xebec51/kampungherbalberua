import { Container } from "@/components/ui/Container";

export default function Loading() {
  return (
    <section className="bg-herbal-cream py-12 sm:py-16" aria-label="Memuat halaman">
      <Container>
        <div className="grid gap-4">
          <div className="h-4 w-36 animate-pulse rounded-full bg-herbal-green/20" />
          <div className="h-10 w-full max-w-2xl animate-pulse rounded-md bg-herbal-green/15" />
          <div className="h-24 w-full max-w-3xl animate-pulse rounded-md bg-white" />
          <div className="grid gap-4 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div
                className="h-44 animate-pulse rounded-md border border-herbal-green/10 bg-white"
                key={item}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
