import { describe, expect, it } from "vitest";
import { products } from "@/data/products";

describe("data produk warga", () => {
  it("memiliki slug stabil dan unik", () => {
    const slugs = products.map((product) => product.slug);

    expect(products).toHaveLength(8);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual([
      "empon-empon",
      "beras-kencur",
      "bunga-telang-rempah",
      "kelor-rempah",
      "secang-rempah",
      "jahe-rempah",
      "ecoenzym-soap",
      "jahe-bubuk",
    ]);
  });

  it("memiliki produsen dan ketersediaan yang konsisten", () => {
    for (const product of products) {
      expect(["Ramuanku", "Kampung Herbal Harmony Berua"]).toContain(
        product.producerName,
      );
      expect(product.whatsappNumber).toBeNull();
      expect(product.price).toBeNull();
      expect(product.availability).toBe("tersedia");
      expect(product.image).toMatch(/^\/images\/products\/.+\.jpg$/);
      expect(Array.isArray(product.benefits)).toBe(true);
    }
  });

  it("mencantumkan manfaat untuk produk yang punya data manfaat dari katalog", () => {
    const withBenefits = products.filter((product) => product.benefits.length > 0);

    expect(withBenefits.map((product) => product.slug)).toEqual([
      "empon-empon",
      "beras-kencur",
      "bunga-telang-rempah",
      "kelor-rempah",
      "secang-rempah",
      "jahe-rempah",
    ]);

    for (const product of withBenefits) {
      for (const benefit of product.benefits) {
        expect(benefit.length).toBeGreaterThan(0);
      }
    }
  });
});
