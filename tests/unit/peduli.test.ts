import { describe, expect, it } from "vitest";
import {
  peduliDisclaimer,
  peduliGuidance,
  peduliIntroduction,
  peduliSource,
  peduliZones,
} from "@/data/peduli";

describe("data PEDULI", () => {
  it("mempertahankan tiga zona utama dan seluruh kelompok dari PDF", () => {
    expect(peduliZones.map((zone) => zone.title)).toEqual([
      "Zona Anak",
      "Zona Dewasa",
      "Zona Rentan",
    ]);
    expect(peduliGuidance).toHaveLength(12);
    expect(
      peduliZones.map((zone) => ({
        count: zone.guidanceSlugs.length,
        id: zone.id,
      })),
    ).toEqual([
      { id: "anak", count: 5 },
      { id: "dewasa", count: 3 },
      { id: "rentan", count: 4 },
    ]);
  });

  it("setiap detail memiliki struktur panduan yang dibutuhkan", () => {
    for (const guidance of peduliGuidance) {
      expect(guidance.slug).toMatch(/^[a-z0-9-]+$/);
      expect(guidance.title.length).toBeGreaterThan(0);
      expect(guidance.englishTitle.length).toBeGreaterThan(0);
      expect(guidance.sourcePages.length).toBeGreaterThan(0);
      expect(guidance.characteristics.length).toBeGreaterThan(0);
      expect(guidance.mainNeeds.length).toBeGreaterThan(0);
      expect(guidance.avoidances.length).toBeGreaterThan(0);
      for (const characteristic of guidance.characteristics) {
        expect(characteristic.title.length).toBeGreaterThan(0);
        expect(
          (characteristic.items?.length ?? 0) +
            (characteristic.paragraphs?.length ?? 0),
        ).toBeGreaterThan(0);
      }
    }
  });

  it("tidak menggabungkan PEDULI dengan HerbaCode atau zona kesehatan herbal", () => {
    const peduliText = JSON.stringify({
      peduliGuidance,
      peduliIntroduction,
      peduliZones,
    });

    expect(peduliText).not.toMatch(/HerbaCode|TOGA|tanaman|ramuan/i);
  });

  it("mencantumkan identitas penyusun, DPK, dan disclaimer edukatif", () => {
    expect(peduliSource.author.name).toBe("Malika Az Zahra Bahtiar");
    expect(peduliSource.author.studyProgram).toBe("Psikologi, 2023");
    expect(peduliSource.supervisor.name).toBe(
      "Prof. Dr. Ir. Suhasman, S.Hut., M.Si.",
    );
    expect(peduliDisclaimer).toContain("panduan edukatif");
    expect(peduliDisclaimer).toContain("bukan pengganti asesmen");
    expect(peduliDisclaimer).toContain("diagnosis");
  });
});
