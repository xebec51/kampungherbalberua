import { describe, expect, it } from "vitest";
import {
  buildAttributionText,
  chooseLicense,
  stripHtml,
} from "../../scripts/media/lib/license";
import {
  detectImageMime,
  sha256,
  storageKey,
} from "../../scripts/media/lib/media-files";
import {
  normalizePlantName,
  validatePosterWorkbook,
} from "../../scripts/media/lib/poster";
import { scorePlantCandidate } from "../../scripts/media/lib/research";
import type { WikimediaCandidate } from "../../scripts/media/lib/wikimedia";

describe("media license governance", () => {
  it("menerima lisensi whitelist", () => {
    const decision = chooseLicense(
      "Creative Commons Attribution-Share Alike 4.0",
      "CC BY-SA 4.0",
      "https://creativecommons.org/licenses/by-sa/4.0/",
    );

    expect(decision.status).toBe("approved");
    expect(decision.code).toBe("CC BY-SA 4.0");
  });

  it("menolak lisensi non-commercial", () => {
    const decision = chooseLicense("CC BY-NC-SA 4.0", "", null);

    expect(decision.status).toBe("rejected");
  });

  it("membersihkan metadata HTML menjadi plain text", () => {
    expect(stripHtml("<b>Nama</b>&nbsp;Kreator &amp; Tim")).toBe(
      "Nama Kreator & Tim",
    );
  });

  it("membuat atribusi tanpa memasukkan HTML", () => {
    expect(
      buildAttributionText({
        creatorName: "Kreator",
        licenseCode: "CC BY 4.0",
        sourcePageUrl: "https://commons.wikimedia.org/wiki/File:test.jpg",
        title: "Foto Jahe",
      }),
    ).toContain("Foto Jahe oleh Kreator");
  });
});

describe("media file safeguards", () => {
  it("mendeteksi magic bytes gambar", () => {
    expect(detectImageMime(Buffer.from([0xff, 0xd8, 0xff, 0x00]))).toBe(
      "image/jpeg",
    );
    expect(() => detectImageMime(Buffer.from("<html>"))).toThrow(
      /Magic bytes/,
    );
  });

  it("membuat checksum dan storage path stabil", () => {
    const checksum = sha256(Buffer.from("kampung herbal"));

    expect(checksum).toMatch(/^[0-9a-f]{64}$/);
    expect(
      storageKey({
        entityKey: "KHB Z01",
        hash: checksum,
        role: "cover",
        scope: "health-zones",
      }),
    ).toMatch(/^health-zones\/khb-z01\/cover-[0-9a-f]{12}\.webp$/);
  });
});

describe("poster workbook validation", () => {
  it("memvalidasi jumlah zona, entri, nama unik, dan gap nomor", () => {
    const summary = validatePosterWorkbook();

    expect(summary.status).toBe("valid");
    expect(summary.zoneCount).toBe(20);
    expect(summary.entryCount).toBe(206);
    expect(summary.uniqueRawNameCount).toBe(89);
    expect(summary.gap157to166Absent).toBe(true);
    expect(summary.duplicatePosterNumbers).toEqual([]);
  });

  it("menormalisasi nama tanaman secara deterministik", () => {
    expect(normalizePlantName("  Daun   Sirih! ")).toBe("daun sirih");
  });
});

describe("plant image candidate scoring", () => {
  it("memberi skor tinggi untuk kandidat berlisensi dan exact match", () => {
    const candidate: WikimediaCandidate = {
      attributionText: "Atribusi",
      creatorName: "Kreator",
      description: "Whole plant Zingiber officinale",
      fileTitle: "File:Zingiber officinale plant.jpg",
      height: 1400,
      licenseCode: "CC BY 4.0",
      licenseReason: "whitelist",
      licenseStatus: "approved",
      licenseUrl: "https://creativecommons.org/licenses/by/4.0/",
      mime: "image/jpeg",
      sha1: "abc",
      size: 1000,
      sourceFileUrl: "https://upload.wikimedia.org/test.jpg",
      sourcePageUrl: "https://commons.wikimedia.org/wiki/File:test.jpg",
      title: "Zingiber officinale",
      width: 1400,
    };

    expect(
      scorePlantCandidate(candidate, "Zingiber officinale").score,
    ).toBeGreaterThanOrEqual(90);
  });
});
