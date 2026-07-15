import { PlantCard } from "@/components/plants/PlantCard";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { featuredPlants } from "@/data/plants";

export function FeaturedPlantsSection() {
  return (
    <section className="bg-white py-16">
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            description="Contoh tanaman yang akan menjadi bagian katalog TOGA. Seluruh informasi masih perlu diverifikasi sebelum publikasi final."
            eyebrow="Tanaman Pilihan"
            title="Katalog awal tanaman TOGA"
          />
          <LinkButton href="/tanaman" variant="secondary">
            Lihat Semua Tanaman
          </LinkButton>
        </div>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPlants.slice(0, 3).map((plant) => (
            <PlantCard key={plant.id} plant={plant} />
          ))}
        </div>
      </Container>
    </section>
  );
}
