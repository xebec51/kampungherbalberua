import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  extractHerbaCodeFromDocx,
  extractHerbaCodeFromParagraphs,
  findHerbaCodeDocumentPath,
  normalizeHerbaCodeName,
} from "../../scripts/herbacode/extract";

describe("HerbaCode extraction", () => {
  const data = extractHerbaCodeFromDocx();

  it("mengekstrak seluruh zona, entri dokumen, dan tanaman unik", () => {
    expect(data.zones).toHaveLength(20);
    expect(data.entries).toHaveLength(205);
    expect(data.uniquePlants).toHaveLength(90);
  });

  it("tidak salah mengoreksi judul zona yang sudah bersih", () => {
    // The document currently in the working tree has no duplicate or
    // numbering-artifact zone titles, so the content-based detector must not
    // invent any corrections (it used to be keyed by occurrence index, which
    // silently mislabeled real zones whenever a document's zone count/order
    // changed).
    expect(data.corrections).toEqual([]);
  });

  it("tidak membuat tanaman unik ganda untuk tanaman yang berulang", () => {
    const jahePlants = data.uniquePlants.filter(
      (plant) => plant.plantKey === normalizeHerbaCodeName("Jahe"),
    );
    const jaheEntries = data.entries.filter(
      (entry) => entry.plantKey === normalizeHerbaCodeName("Jahe"),
    );

    expect(jahePlants).toHaveLength(1);
    expect(jaheEntries).toHaveLength(8);
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

  it("menyimpan SHA-256 dokumen pada JSON ekstraksi", () => {
    expect(data.documentSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("tidak menyisakan karakter titik dua di depan nilai field mana pun", () => {
    for (const entry of data.entries) {
      const scalarFields = [entry.localName, entry.scientificName];
      const listFields = [
        entry.activeCompounds,
        entry.benefits,
        entry.usedParts,
        entry.cultivationTechniques,
        entry.preparationMethods,
        entry.warnings,
      ].flat();

      for (const value of [...scalarFields, ...listFields]) {
        if (typeof value === "string") {
          expect(value.startsWith(":")).toBe(false);
        }
      }
    }
  });

  it("importer tidak mengisi jalan dari zona atau meng-upsert ulang plant existing", () => {
    const source = readFileSync("scripts/herbacode/import.ts", "utf8");

    expect(source).toContain("street_name: null");
    expect(source).not.toContain("street_name: zone.title");
    expect(source).not.toContain("upsert(matchedRows");
    expect(source).toContain("readStoredHerbaCodeData");
  });
});

describe("HerbaCode extraction: format zona tanpa label 'Nama lokal'", () => {
  it("memakai judul entri sebagai nama lokal dan menjangkarkan entri pada 'Nama ilmiah'", () => {
    const paragraphs = [
      "Zona Uji Otak",
      "Pegagan",
      "Nama ilmiah",
      "Centella asiatica",
      "Kandungan senyawa aktif",
      "Asiaticoside",
      "Manfaat dalam bidang kesehatan",
      "Membantu daya ingat.",
      "Bagian tanaman yang digunakan Daun.",
      "Teknik budidaya",
      "Diperbanyak dengan stolon.",
      "Perhatian",
      "Konsumsi wajar.",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");

    expect(data.entries).toHaveLength(1);
    expect(data.entries[0]?.localName).toBe("Pegagan");
    expect(data.entries[0]?.scientificName).toBe("Centella asiatica");
    expect(data.entries[0]?.benefits).toContain("Membantu daya ingat.");
    expect(data.entries[0]?.usedParts).toContain("Daun.");
  });
});

describe("HerbaCode extraction: format label 'Label: value' sebaris", () => {
  it("mem-parsing seluruh field kolon tanpa menyisakan titik dua, termasuk label 'Manfaat kesehatan'", () => {
    const paragraphs = [
      "Zona Uji Kolon",
      "1. Kunyit",
      "Nama lokal: Kunyit, Kunir (Jawa)",
      "Nama ilmiah: Curcuma longa L.",
      "Kandungan senyawa aktif: Kurkumin, minyak atsiri",
      "Manfaat kesehatan: Antiinflamasi, antioksidan",
      "Bagian tanaman yang digunakan: Rimpang",
      "Teknik budidaya: Ditanam dari rimpang",
      "Perhatian: Konsultasi dokter bila hamil",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");
    const entry = data.entries[0];

    expect(entry?.localName).toBe("Kunyit, Kunir (Jawa)");
    expect(entry?.scientificName).toBe("Curcuma longa L.");
    expect(entry?.activeCompounds).toEqual(["Kurkumin, minyak atsiri"]);
    expect(entry?.benefits).toEqual(["Antiinflamasi, antioksidan"]);
    expect(entry?.usedParts).toEqual(["Rimpang"]);
    expect(entry?.cultivationTechniques).toEqual(["Ditanam dari rimpang"]);
    expect(entry?.warnings).toEqual(["Konsultasi dokter bila hamil"]);
  });

  it("menangani label tanpa pemisah sama sekali khusus 'Nama ilmiah'", () => {
    const paragraphs = [
      "Zona Uji Tanpa Pemisah",
      "Kayu Manis",
      "Nama lokal Kayu Manis",
      "Nama ilmiahCinnamomum burmannii (Nees & T.Nees) Blume",
      "Kandungan senyawa aktif",
      "Sinamaldehida",
      "Manfaat",
      "Antioksidan.",
      "Bagian tanaman yang digunakan Kulit batang.",
      "Teknik budidaya",
      "Ditanam dari biji.",
      "Perhatian",
      "Gunakan secukupnya.",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");

    expect(data.entries[0]?.scientificName).toBe(
      "Cinnamomum burmannii (Nees & T.Nees) Blume",
    );
  });
});

describe("HerbaCode extraction: detektor anomali judul zona berbasis konten", () => {
  it("menghapus artefak nomor sumber pada judul zona secara mekanis", () => {
    const paragraphs = [
      "Zona Imun",
      "Meniran",
      "Nama ilmiah",
      "Phyllanthus niruri L.",
      "Manfaat",
      "Membantu imun.",
      "Zona 18 – Anti Mikroba",
      "Bawang Putih",
      "Nama ilmiah",
      "Allium sativum L.",
      "Manfaat",
      "Antibakteri.",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");

    expect(data.zones[1]?.title).toBe("Zona Anti Mikroba");
    expect(data.corrections).toHaveLength(1);
    expect(data.corrections[0]).toMatchObject({
      correctedTitle: "Zona Anti Mikroba",
      rawTitle: "Zona 18 – Anti Mikroba",
    });
  });

  it("menandai (bukan menebak) judul zona yang identik dengan zona sebelumnya", () => {
    const paragraphs = [
      "Zona Kulit Sehat",
      "Lidah Buaya",
      "Nama ilmiah",
      "Aloe vera",
      "Manfaat",
      "Melembapkan kulit.",
      "Zona Kulit Sehat",
      "Sirih",
      "Nama ilmiah",
      "Piper betle L.",
      "Manfaat",
      "Antibakteri mulut.",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");

    expect(data.zones[0]?.title).toBe("Zona Kulit Sehat");
    expect(data.zones[1]?.title).not.toBe("Zona Kulit Sehat");
    expect(data.corrections).toHaveLength(1);
    expect(data.corrections[0]?.rawTitle).toBe("Zona Kulit Sehat");
  });

  it("tidak salah mendeteksi zona baru bergaya lain sebagai artefak nomor", () => {
    // Guards against the old occurrence-indexed table's failure mode: a zone
    // that is legitimately new (not an anomaly) must never be relabeled just
    // because of its position in the document.
    const paragraphs = [
      "Zona Antikanker (Potensial)",
      "1. Sirsak",
      "Nama ilmiah: Annona muricata L.",
      "Manfaat kesehatan: Antioksidan.",
    ];
    const data = extractHerbaCodeFromParagraphs(paragraphs, "test.docx");

    expect(data.zones[0]?.title).toBe("Zona Antikanker (Potensial)");
    expect(data.corrections).toHaveLength(0);
  });
});

describe("findHerbaCodeDocumentPath", () => {
  function withTempDir(fn: (dir: string) => void) {
    const dir = mkdtempSync(join(tmpdir(), "herbacode-doc-"));
    try {
      fn(dir);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  }

  it("mengembalikan null bila tidak ada file DOCX HerbaCode", () => {
    withTempDir((dir) => {
      expect(findHerbaCodeDocumentPath(dir)).toBeNull();
    });
  });

  it("menemukan satu file DOCX HerbaCode yang tersedia", () => {
    withTempDir((dir) => {
      writeFileSync(join(dir, "herba code (1).docx"), "");
      expect(findHerbaCodeDocumentPath(dir)).toBe("herba code (1).docx");
    });
  });

  it("gagal secara eksplisit bila menemukan lebih dari satu kandidat DOCX", () => {
    withTempDir((dir) => {
      writeFileSync(join(dir, "herba code (1).docx"), "");
      writeFileSync(join(dir, "herba code (2).docx"), "");
      expect(() => findHerbaCodeDocumentPath(dir)).toThrow(/--document/);
    });
  });
});
