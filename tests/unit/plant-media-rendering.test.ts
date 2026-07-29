import React from "react";
import { readFileSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Plant } from "../../src/types";

vi.mock("next/image", () => ({
  default: ({
    alt,
    className,
    onError,
    sizes,
    src,
  }: {
    alt: string;
    className?: string;
    onError?: () => void;
    sizes?: string;
    src: string;
  }) =>
    React.createElement("img", {
      alt,
      className,
      "data-has-error-handler": onError ? "true" : "false",
      sizes,
      src,
    }),
}));

const STORAGE_IMAGE_URL =
  "https://xkvgpauprhggykaxffkh.supabase.co/storage/v1/object/public/media-public/plants/khb-plant-jahe/cover.webp";

const plant: Plant = {
  id: "plant-jahe",
  slug: "jahe",
  localName: "Jahe",
  scientificName: "Zingiber officinale",
  otherNames: [],
  category: "Rimpang",
  shortDescription: "Data demonstrasi tanaman.",
  description: "Data demonstrasi tanaman.",
  usedParts: [],
  traditionalUses: [],
  preparation: [],
  careInstructions: [],
  warnings: [],
  image: STORAGE_IMAGE_URL,
  locationStatus: "Kebun contoh",
  source: "Data demonstrasi",
  validator: "Menunggu verifikasi",
  validationStatus: "data-demonstrasi",
  featured: true,
  published: true,
};

describe("plant media rendering", () => {
  it("PlantCard menggunakan URL plant.image dan sizes responsif", async () => {
    const { PlantCard } = await import("../../src/components/plants/PlantCard");
    const html = renderToString(React.createElement(PlantCard, { plant }));

    expect(html).toContain(STORAGE_IMAGE_URL);
    expect(html).toContain("Tanaman Jahe");
    expect(html).toContain(
      "(max-width: 640px) 92vw, (max-width: 1024px) 46vw, (max-width: 1279px) 30vw, 18rem",
    );
  });

  it("PlantCard menampilkan placeholder saat image kosong", async () => {
    const { PlantCard } = await import("../../src/components/plants/PlantCard");
    const html = renderToString(
      React.createElement(PlantCard, { plant: { ...plant, image: "" } }),
    );

    expect(html).toContain("Gambar sementara tanaman Jahe");
    expect(html).not.toContain("<img");
  });

  it("SafeImage memiliki fallback saat gambar gagal dimuat", () => {
    const safeImageSource = readFileSync(
      "src/components/ui/SafeImage.tsx",
      "utf8",
    );

    expect(safeImageSource).toContain("onError={() => setHasError(true)}");
    expect(safeImageSource).toContain("!resolvedSrc || hasError");
  });

  it("halaman detail tanaman menggunakan image tanaman", () => {
    const detailPageSource = readFileSync(
      "src/app/tanaman/[slug]/page.tsx",
      "utf8",
    );

    expect(detailPageSource).toContain('import { SafeImage }');
    expect(detailPageSource).toContain("src={plant.image}");
    expect(detailPageSource).toContain("Tanaman ${plant.localName}");
  });

  it("kartu beranda memakai PlantCard sehingga image ikut muncul", () => {
    const homeSectionSource = readFileSync(
      "src/components/home/FeaturedPlantsSection.tsx",
      "utf8",
    );

    expect(homeSectionSource).toContain("<PlantCard key={plant.id} plant={plant} />");
    expect(homeSectionSource).not.toContain("priority={index === 0}");
  });
});
