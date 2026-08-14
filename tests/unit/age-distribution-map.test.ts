import { existsSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { ageDistributionMapConfig } from "@/data/age-distribution-map";

function publicAssetPath(src: string) {
  return path.join(process.cwd(), "public", src.replace(/^\//, ""));
}

describe("age distribution map configuration", () => {
  it("mengacu pada peta kelompok usia RT 009/RW 006 sebagai aset publik", () => {
    expect(ageDistributionMapConfig.title).toBe(
      "Peta Persebaran Kelompok Usia",
    );
    expect(ageDistributionMapConfig.location).toBe(
      "RT 009/RW 006 - Kelurahan Berua - Kecamatan Biringkanaya - Kota Makassar",
    );
    expect(ageDistributionMapConfig.sourceLabel).toBe(
      "KKN Prestasi Gel. 116 - Universitas Hasanuddin",
    );
    expect(ageDistributionMapConfig.displayImage.src).toBe(
      "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.webp",
    );
    expect(ageDistributionMapConfig.downloadImage.src).toBe(
      "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.png",
    );
    expect(ageDistributionMapConfig.displayImage.src).not.toMatch(
      /PNG PETA PERSEBARAN USIA/i,
    );
  });

  it("tidak menyimpan koordinat atau entri warga terstruktur", () => {
    const serializedConfig = JSON.stringify(ageDistributionMapConfig);

    expect(serializedConfig).not.toMatch(/latitude|longitude|coordinates/i);
    expect(serializedConfig).not.toMatch(/nomor\s+rumah|household|resident/i);
  });

  it("memakai turunan gambar tanpa metadata EXIF atau XMP", async () => {
    for (const asset of [
      ageDistributionMapConfig.displayImage,
      ageDistributionMapConfig.downloadImage,
    ]) {
      const assetPath = publicAssetPath(asset.src);

      expect(existsSync(assetPath)).toBe(true);

      const metadata = await sharp(assetPath, {
        limitInputPixels: false,
      }).metadata();

      expect(metadata.width).toBe(asset.width);
      expect(metadata.height).toBe(asset.height);
      expect(metadata.exif).toBeUndefined();
      expect(metadata.xmp).toBeUndefined();
      expect(metadata.icc).toBeUndefined();
    }
  });
});
