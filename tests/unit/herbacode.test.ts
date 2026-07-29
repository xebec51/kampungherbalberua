import { describe, expect, it } from "vitest";
import {
  extractHerbaCodeFromDocx,
  normalizeHerbaCodeName,
} from "../../scripts/herbacode/extract";

describe("HerbaCode extraction", () => {
  const data = extractHerbaCodeFromDocx();

  it("mengekstrak seluruh zona, entri dokumen, dan tanaman unik", () => {
    expect(data.zones).toHaveLength(9);
    expect(data.entries).toHaveLength(95);
    expect(data.uniquePlants).toHaveLength(50);
  });

  it("mencatat koreksi judul yang jelas berdasarkan konteks", () => {
    expect(data.corrections).toEqual([
      expect.objectContaining({
        correctedTitle: "Zona Kesehatan Mulut",
        rawTitle: "Zona Tulang & Sendi",
      }),
      expect.objectContaining({
        correctedTitle: "Zona Anti Mikroba",
        rawTitle: "Zona 18 – Anti Mikroba",
      }),
      expect.objectContaining({
        correctedTitle: "Zona Kesehatan Perempuan",
        rawTitle: "Zona 19 Kesehatan Perempuan",
      }),
    ]);
  });

  it("tidak membuat tanaman unik ganda untuk tanaman yang berulang", () => {
    const jahePlants = data.uniquePlants.filter(
      (plant) => plant.plantKey === normalizeHerbaCodeName("Jahe"),
    );
    const jaheEntries = data.entries.filter(
      (entry) => entry.plantKey === normalizeHerbaCodeName("Jahe"),
    );

    expect(jahePlants).toHaveLength(1);
    expect(jaheEntries).toHaveLength(4);
  });

  it("menjaga manfaat tetap terpisah per zona", () => {
    const jaheEntries = data.entries.filter(
      (entry) => entry.plantKey === normalizeHerbaCodeName("Jahe"),
    );
    const benefitsByZone = new Map(
      jaheEntries.map((entry) => [entry.zoneTitle, entry.benefits]),
    );

    expect(benefitsByZone.get("Zona Pencernaan Sehat")).toContain(
      "Membantu meredakan mual dan muntah.",
    );
    expect(benefitsByZone.get("Zona Tulang & Sendi")).toContain(
      "Membantu meredakan nyeri dan kekakuan sendi.",
    );
  });

  it("menyimpan cara pemanfaatan hanya bila tersedia di dokumen", () => {
    const jaheEntries = data.entries.filter(
      (entry) => entry.plantKey === normalizeHerbaCodeName("Jahe"),
    );
    const jintanHitam = data.entries.find(
      (entry) => entry.plantKey === normalizeHerbaCodeName("Jintan Hitam"),
    );

    expect(jaheEntries.every((entry) => entry.preparationMethods.length === 0)).toBe(true);
    expect(jintanHitam?.preparationMethods).toContain(
      "Dikonsumsi dalam bentuk biji, minyak, maupun kapsul herbal terstandar.",
    );
  });
});
