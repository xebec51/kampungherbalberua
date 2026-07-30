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
        <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
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
    <div className="rounded-md border border-white/12 bg-white/10 p-5 shadow-sm backdrop-blur">
      <dt className="text-sm font-bold text-white/72">{label}</dt>
      <dd className="mt-2 text-3xl font-bold text-herbal-gold">
        {value}
      </dd>
    </div>
  );
}
