import { describe, expect, it } from "vitest";
import {
  communityMapConfig,
  communityMapLegend,
} from "@/data/map-config";

describe("community map configuration", () => {
  it("menyimpan lokasi dan URL eksternal tanpa koordinat tebakan", () => {
    expect(communityMapConfig.locationName).toBe(
      "Kampung Herbal Harmony Berua",
    );
    expect(communityMapConfig.regionLines).toEqual([
      "RT 009/RW 006",
      "Kelurahan Berua",
      "Kecamatan Biringkanaya",
    ]);
    expect(communityMapConfig.googleMapsUrl).toBe(
      "https://maps.app.goo.gl/LZi2bArDspCxwpgn6",
    );
    expect(communityMapConfig.googleMapsUrl).not.toMatch(/@-?\d|\?q=-?\d/);
  });

  it("menyiapkan kategori legenda peta publik", () => {
    expect(communityMapLegend.map((item) => item.id)).toEqual([
      "streets",
      "zones",
      "facilities",
      "entrances",
      "information",
    ]);
    expect(new Set(communityMapLegend.map((item) => item.id)).size).toBe(
      communityMapLegend.length,
    );
  });
});
