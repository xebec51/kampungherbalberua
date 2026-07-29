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
    <section className="home-section bg-herbal-soft py-16">
      <Container className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-start">
        <div>
          <SectionHeading
            description="HerbaCode menghubungkan tanaman dengan zona kesehatan, senyawa aktif, bagian yang digunakan, manfaat, teknik budidaya, perhatian, dan cara pemanfaatan bila tersedia."
            eyebrow="HerbaCode"
            title="Data tanaman dan zona dari dokumen HerbaCode"
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
    <div className="rounded-md border border-herbal-green/10 bg-white p-5 shadow-sm">
      <dt className="text-sm font-bold text-herbal-muted">{label}</dt>
      <dd className="mt-2 text-3xl font-extrabold text-herbal-deep">
        {value}
      </dd>
    </div>
  );
}
