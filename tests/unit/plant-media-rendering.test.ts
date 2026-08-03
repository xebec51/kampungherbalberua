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
  imageMedia: null,
  localName: "Jahe",
  scientificName: "Zingiber officinale",
  shortDescription:
    "Rimpang aromatik yang secara tradisional digunakan untuk membantu menghangatkan tubuh.",
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
      zoneDisplayOrder: 2,
      zoneId: "khb-z02",
      zoneSlug: "pencernaan-sehat",
      zoneShortDescription:
        "Sistem pencernaan mengolah makanan, menyerap zat gizi, dan membuang sisa yang tidak diperlukan tubuh.",
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
    expect(html).not.toContain("Rimpang aromatik");
    expect(html).not.toContain("Zona Pencernaan Sehat");
    expect(html).toContain(
      "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem",
    );
  });

  it("HerbaCodePlantCard menampilkan placeholder tanaman ketika media tidak ada", async () => {
    const { HerbaCodePlantCard } = await import(
      "../../src/components/plants/HerbaCodePlantCard"
    );
    const html = renderToString(
      React.createElement(HerbaCodePlantCard, {
        plant: { ...plant, image: null },
      }),
    );

    expect(html).not.toContain("<img");
    expect(html).toContain("image-placeholder");
    expect(html).toContain('data-placeholder-variant="plant"');
    expect(html).toContain('role="img"');
    expect(html).toContain('aria-label="Tanaman Jahe"');
    expect(html).not.toMatch(/gambar sementara|menyusul/i);
  });

  it("HerbaCodeZoneCard tidak menampilkan kode zona atau placeholder visual", async () => {
    const { HerbaCodeZoneCard } = await import(
      "../../src/components/zones/HerbaCodeZoneCard"
    );
    const zone: HerbaCodeZoneSummary = {
      displayOrder: 1,
      id: "khb-z01",
      plantCount: 11,
      slug: "imunitas-kuat",
      shortDescription:
        "Sistem imun membantu tubuh mengenali dan merespons kuman, zat asing, serta perubahan sel yang berpotensi mengganggu kesehatan.",
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
    expect(html).toContain("Sistem imun membantu tubuh");
    expect(html).not.toContain(
      "Data tanaman dan pemanfaatan tradisional pada zona ini bersumber dari HerbaCode.",
    );
    expect(html).not.toMatch(/gambar sementara|menyusul/i);
  });

  it("ZonePlantMiniCard menampilkan visual, ringkasan, dan link tanaman", async () => {
    const { ZonePlantMiniCard } = await import(
      "../../src/components/zones/ZonePlantMiniCard"
    );
    const html = renderToString(
      React.createElement(ZonePlantMiniCard, {
        entry: plant.zoneEntries[0],
        plant,
      }),
    );

    expect(html).toContain('href="/tanaman/jahe"');
    expect(html).toContain(STORAGE_IMAGE_URL);
    expect(html).toContain("Tanaman Jahe");
    expect(html).toContain("Zingiber officinale");
    expect(html).toContain("Rimpang aromatik");
    expect(html).toContain("Lihat tanaman");
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

  it("halaman detail tanaman memakai SafeImage untuk media atau placeholder tanaman", () => {
    const detailPageSource = readFileSync(
      "src/app/tanaman/[slug]/page.tsx",
      "utf8",
    );

    expect(detailPageSource).toContain('import { SafeImage }');
    expect(detailPageSource).toContain("visibleDetailImageSrc");
    expect(detailPageSource).toContain("PlantDetailImage");
    expect(detailPageSource).toContain("src={visual.src}");
    expect(detailPageSource).toContain("src: null");
  });

  it("kartu beranda memakai HerbaCodePlantCard", () => {
    const homeSectionSource = readFileSync(
      "src/components/home/FeaturedPlantsSection.tsx",
      "utf8",
    );

    expect(homeSectionSource).toContain("<HerbaCodePlantCard key={plant.id} plant={plant} />");
  });
});
