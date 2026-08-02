import { describe, expect, it } from "vitest";
import { products } from "@/data/products";

describe("data produk warga", () => {
  it("memiliki slug stabil dan unik", () => {
    const slugs = products.map((product) => product.slug);

    expect(products).toHaveLength(6);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toEqual([
      "teh-herbal-berua",
      "minuman-jahe-rempah",
      "kunyit-asam",
      "simplisia-herbal-kering",
      "bibit-tanaman-toga",
      "paket-tanaman-herbal-rumah",
    ]);
  });

  it("memiliki produsen dan ketersediaan yang konsisten", () => {
    for (const product of products) {
      expect(product.producerName).toBe("Kampung Herbal Harmony Berua");
      expect(product.whatsappNumber).toBeNull();
      expect(product.price).toBeNull();
      expect(product.availability).toBe("segera-tersedia");
      expect(product.image).toMatch(/^\/images\/products\/examples\/.+\.webp$/);
    }
  });
});
