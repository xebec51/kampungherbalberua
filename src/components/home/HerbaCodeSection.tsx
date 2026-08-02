import { Container } from "@/components/ui/Container";
import { LinkButton } from "@/components/ui/LinkButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import {
  getHerbaCodePlantCatalog,
  getHerbaCodeZoneSummaries,
} from "@/lib/data/herbacode";

export async function HerbaCodeSection() {
  const [plants, zones] = await Promise.all([
    getHerbaCodePlantCatalog(),
    getHerbaCodeZoneSummaries(),
  ]);
  const relationCount = plants.reduce(
    (total, plant) => total + plant.zoneEntries.length,
    0,
  );

  return (
    <section className="home-section brand-pattern bg-herbal-green py-16 text-white">
      <Container className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div>
          <SectionHeading
            description="HerbaCode menghubungkan tanaman dengan zona kesehatan, senyawa aktif, bagian yang digunakan, manfaat, teknik budidaya, perhatian, dan cara pemanfaatan bila tersedia."
            eyebrow="HerbaCode"
            title="Data tanaman dan zona dari dokumen HerbaCode"
            tone="dark"
          />
          <div className="mt-6">
            <LinkButton href="/tanaman" variant="secondary">
              Buka Katalog HerbaCode
            </LinkButton>
          </div>
        </div>
        <dl className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1">
          <Metric label="Zona" value={zones.length} />
          <Metric label="Tanaman unik" value={plants.length} />
          <Metric label="Relasi tanaman-zona" value={relationCount} />
        </dl>
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
