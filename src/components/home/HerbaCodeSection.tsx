import { Reveal } from "@/components/motion/Reveal";
import { StaggerGroup } from "@/components/motion/StaggerGroup";
import { StaggerItem } from "@/components/motion/StaggerItem";
import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getHerbaCodePlantCatalog,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";
import { getPosterPlantCatalog } from "@/lib/data/poster-plants";
import { buildUnifiedPlantCatalog } from "@/lib/plant-catalog-filter";

export async function HerbaCodeSection() {
  const [herbaCodePlants, posterPlants, zones] = await Promise.all([
    getHerbaCodePlantCatalog(),
    getPosterPlantCatalog(),
    getHerbaCodeZoneSummaries(),
  ]);
  const uniquePlantCount = buildUnifiedPlantCatalog(posterPlants, herbaCodePlants)
    .length;
  const relationCount = herbaCodePlants.reduce(
    (total, plant) => total + plant.zoneEntries.length,
    0,
  );

  return (
    <section className="home-section brand-pattern bg-herbal-green py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div>
          <Reveal>
            <SectionHeading
              description="HerbaCode menghubungkan tanaman dengan zona kesehatan, senyawa aktif, bagian yang digunakan, manfaat, teknik budidaya, perhatian, dan cara pemanfaatan bila tersedia."
              eyebrow="HerbaCode"
              title="Data tanaman dan zona dari dokumen HerbaCode"
              tone="dark"
            />
          </Reveal>
          <div className="mt-6">
            <LinkButton href="/tanaman" variant="secondary">
              Buka Katalog HerbaCode
            </LinkButton>
          </div>
        </div>
        <StaggerGroup as="dl" className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
          <StaggerItem>
            <Metric label="Zona" value={zones.length} />
          </StaggerItem>
          <StaggerItem>
            <Metric label="Tanaman unik" value={uniquePlantCount} />
          </StaggerItem>
          <StaggerItem>
            <Metric label="Relasi tanaman-zona" value={relationCount} />
          </StaggerItem>
        </StaggerGroup>
      </Container>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-white/12 bg-white/10 p-3 shadow-sm backdrop-blur sm:p-5">
      <dt className="text-xs font-bold leading-tight text-white/72 sm:text-sm">
        {label}
      </dt>
      <dd className="mt-2 text-xl font-bold text-herbal-gold sm:text-3xl">
        {value}
      </dd>
    </div>
  );
}
