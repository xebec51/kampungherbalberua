import type { Metadata } from "next";
import { Suspense } from "react";
import { HealthConditionCatalog } from "@/components/health-conditions/HealthConditionCatalog";
import { Container } from "@/components/ui/Container";
import { getHealthConditions } from "@/lib/data/health-conditions";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  title: "Katalog Penyakit",
  description:
    "Katalog penyakit Kampung Herbal Harmony Berua beserta tanaman yang secara tradisional dimanfaatkan untuk masing-masing kondisi.",
  path: "/penyakit",
});

export default async function HealthConditionsPage() {
  const healthConditions = await getHealthConditions();

  return (
    <section className="brand-pattern border-b border-herbal-green/10 bg-herbal-cream py-6 text-herbal-ink sm:py-7 lg:py-8">
      <Container>
        <Suspense
          fallback={
            <p className="text-sm text-herbal-muted">Memuat katalog penyakit.</p>
          }
        >
          <HealthConditionCatalog
            eyebrow="Katalog Penyakit"
            healthConditions={healthConditions}
            title="Katalog Penyakit Kampung Herbal"
          />
        </Suspense>
      </Container>
    </section>
  );
}
