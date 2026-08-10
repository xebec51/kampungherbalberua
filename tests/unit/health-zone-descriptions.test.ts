import { describe, expect, it } from "vitest";
import { getHealthZoneShortDescription } from "../../src/lib/content/health-zone-descriptions";

describe("getHealthZoneShortDescription", () => {
  it("mengembalikan deskripsi kurasi untuk zona lama yang sudah dikenal", () => {
    expect(getHealthZoneShortDescription("imunitas-kuat", "Zona Imunitas Kuat")).toContain(
      "Sistem imun",
    );
  });

  it("mengembalikan deskripsi asli (bukan string kosong) untuk zona baru tanpa kurasi manual", () => {
    // A zone newly added by a HerbaCode document update has no curated entry
    // yet. Its own title-shaped description must still be shown -- not
    // discarded into an empty string -- until a human curates it. Uses a
    // fictional slug since all 20 real HerbaCode zones now have a curated
    // entry in descriptionsBySlug (see the two tests below).
    expect(
      getHealthZoneShortDescription("zona-belum-dikurasi", "Zona Belum Dikurasi"),
    ).toBe("Zona Belum Dikurasi");
  });

  it("mengembalikan string kosong hanya bila benar-benar tidak ada deskripsi sama sekali", () => {
    expect(getHealthZoneShortDescription("zona-belum-dikurasi", null)).toBe("");
    expect(getHealthZoneShortDescription("zona-belum-dikurasi", undefined)).toBe("");
  });

  it("mengembalikan deskripsi kurasi (bukan judul apa adanya) untuk seluruh 20 zona HerbaCode", () => {
    // Regression test: these 11 zones previously had no curated entry, so
    // the public /zona-kesehatan list rendered their own title as the
    // description (e.g. "Zona Gula Darah Terkendali" shown twice).
    const previouslyUncuratedSlugs = [
      "gula-darah-terkendali",
      "pernapasan-lega",
      "otak-cerdas",
      "anak-ceria",
      "kulit-cantik",
      "detoks-dan-antioksidan",
      "antiinflamasi-dan-nyeri",
      "antikanker-potensial",
      "obesitas-dan-metabolik",
      "tidur-dan-relaksasi",
      "kesehatan-mata",
    ];

    for (const slug of previouslyUncuratedSlugs) {
      const titleLikeText = `Zona ${slug.replaceAll("-", " ")}`;
      const description = getHealthZoneShortDescription(slug, titleLikeText);

      expect(description).not.toBe(titleLikeText);
      expect(description.length).toBeGreaterThan(20);
    }
  });

  it("deskripsi zona antikanker tidak mengklaim mencegah atau mengobati kanker", () => {
    const description = getHealthZoneShortDescription(
      "antikanker-potensial",
      "Zona Antikanker (Potensial)",
    );

    expect(description.toLowerCase()).not.toMatch(/mencegah kanker|mengobati kanker|menyembuhkan kanker/);
  });
});
