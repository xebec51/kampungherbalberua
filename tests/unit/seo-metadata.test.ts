import { describe, expect, it } from "vitest";
import {
  createRootMetadata,
  createRootStructuredData,
  siteDescription,
  siteName,
} from "@/lib/metadata";

describe("SEO metadata", () => {
  it("memakai nama brand lengkap dan deskripsi homepage yang jelas", () => {
    const metadata = createRootMetadata();

    expect(siteName).toBe("Kampung Herbal Harmony Berua");
    expect(siteDescription).toContain("RT 009/RW 006");
    expect(siteDescription).toContain("Kelurahan Berua");
    expect(metadata.description).toBe(siteDescription);
    expect(metadata.manifest).toBe("/manifest.webmanifest");
  });

  it("menyediakan structured data tanpa koordinat rumah", () => {
    const structuredDataText = JSON.stringify(createRootStructuredData());

    expect(structuredDataText).toContain("WebSite");
    expect(structuredDataText).toContain("Organization");
    expect(structuredDataText).toContain("Kampung Herbal Harmony Berua");
    expect(structuredDataText).toContain("https://maps.app.goo.gl/LZi2bArDspCxwpgn6");
    expect(structuredDataText).not.toMatch(/latitude|longitude|geo/i);
  });
});
