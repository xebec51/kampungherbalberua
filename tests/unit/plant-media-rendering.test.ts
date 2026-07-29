import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { HerbaCodePlantProfile, HerbaCodeZoneSummary } from "../../src/types";

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    sizes,
    src,
  }: {
    alt: string;
    className?: string;
    sizes?: string;
    src: string;
  }) =>
    React.createElement("img", {
      alt,
      className,
      sizes,
      src,
    }),
}));

const STORAGE_IMAGE_URL =
  "https://xkvgpauprhggykaxffkh.supabase.co/storage/v1/object/public/media-public/plants/khb-plant-jahe/cover.webp";

const plant: HerbaCodePlantProfile = {
  aliases: [],
  id: "plant-jahe",
  image: STORAGE_IMAGE_URL,
  localName: "Jahe",
  scientificName: "Zingiber officinale",
  slug: "jahe",
  sourceDocumentName: "HerbaCode Kampung Herbal Harmony",
  zoneEntries: [
    {
      activeCompounds: ["Gingerol"],
      benefits: ["Membantu meredakan mual dan muntah."],
      cultivationTechniques: [],
      entryOrder: 1,
      id: "pencernaan-sehat:jahe",
      localName: "Jahe",
      plantId: "plant-jahe",
      plantLocalName: "Jahe",
      plantScientificName: "Zingiber officinale",
      plantSlug: "jahe",
      preparationMethods: [],
      scientificName: "Zingiber officinale",
      sourceDocumentName: "HerbaCode Kampung Herbal Harmony",
      usedParts: ["Rimpang."],
      warnings: [],
      zoneCode: "khb-z02",
      zoneId: "khb-z02",
      zoneSlug: "pencernaan-sehat",
      zoneTitle: "Zona Pencernaan Sehat",
    },
  ],
};

describe("plant media rendering", () => {
  it("HerbaCodePlantCard menggunakan URL image dan sizes responsif", async () => {
    const { HerbaCodePlantCard } = await import(
      "../../src/components/plants/HerbaCodePlantCard"
    );
    const html = renderToString(React.createElement(HerbaCodePlantCard, { plant }));

    expect(html).toContain(STORAGE_IMAGE_URL);
    expect(html).toContain("Tanaman Jahe");
    expect(html).toContain(
      "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem",
    );
  });

  it("HerbaCodePlantCard menyembunyikan slot gambar ketika media tidak ada", async () => {
    const { HerbaCodePlantCard } = await import(
      "../../src/components/plants/HerbaCodePlantCard"
    );
    const html = renderToString(
      React.createElement(HerbaCodePlantCard, {
        plant: { ...plant, image: null },
      }),
    );

    expect(html).not.toContain("<img");
    expect(html).not.toContain("image-placeholder");
    expect(html).not.toContain('role="img"');
    expect(html).not.toMatch(/gambar sementara|menyusul/i);
  });

  it("HerbaCodeZoneCard tidak menampilkan kode zona atau placeholder visual", async () => {
    const { HerbaCodeZoneCard } = await import(
      "../../src/components/zones/HerbaCodeZoneCard"
    );
    const zone: HerbaCodeZoneSummary = {
      id: "khb-z01",
      plantCount: 11,
      slug: "imunitas-kuat",
      streetNames: ["Jl. Imun"],
      title: "Zona Imunitas Kuat",
      zoneCode: "khb-z01",
    };
    const html = renderToString(
      React.createElement(HerbaCodeZoneCard, { zone }),
    );

    expect(html).not.toContain("<img");
    expect(html).not.toContain("image-placeholder");
    expect(html).not.toContain("khb-z01");
    expect(html).toContain("Jl. Imun");
    expect(html).not.toMatch(/gambar sementara|menyusul/i);
  });

  it("SafeImage tetap server-rendered dan tidak menambah handler gambar per kartu", () => {
    const safeImageSource = readFileSync(
      "src/components/ui/SafeImage.tsx",
      "utf8",
    );

    expect(safeImageSource).not.toContain('"use client"');
    expect(safeImageSource).not.toContain("useState");
    expect(safeImageSource).not.toContain("onError");
    expect(safeImageSource).toContain("!resolvedSrc || isLocalPlaceholder(resolvedSrc)");
  });

  it("halaman detail tanaman hanya memakai SafeImage saat media tersedia", () => {
    const detailPageSource = readFileSync(
      "src/app/tanaman/[slug]/page.tsx",
      "utf8",
    );

    expect(detailPageSource).toContain('import { SafeImage }');
    expect(detailPageSource).toContain("plant.image ? (");
    expect(detailPageSource).toContain("src={plant.image}");
  });

  it("kartu beranda memakai HerbaCodePlantCard", () => {
    const homeSectionSource = readFileSync(
      "src/components/home/FeaturedPlantsSection.tsx",
      "utf8",
    );

    expect(homeSectionSource).toContain("<HerbaCodePlantCard key={plant.id} plant={plant} />");
  });
});
