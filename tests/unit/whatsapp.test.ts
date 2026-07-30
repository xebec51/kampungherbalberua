import { describe, expect, it } from "vitest";
import {
  createProductOrderMessage,
  createProductOrderWhatsAppUrl,
  createWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";
import { products } from "@/data/products";

describe("nomor WhatsApp", () => {
  it("menormalkan nomor lokal Indonesia ke format wa.me", () => {
    expect(normalizeWhatsAppNumber("089623080501")).toBe("6289623080501");
    expect(normalizeWhatsAppNumber("+62 896-2308-0501")).toBe("6289623080501");
    expect(normalizeWhatsAppNumber("89623080501")).toBe("6289623080501");
  });

  it("menolak nomor kosong atau terlalu pendek", () => {
    expect(normalizeWhatsAppNumber(null)).toBeNull();
    expect(normalizeWhatsAppNumber("   ")).toBeNull();
    expect(normalizeWhatsAppNumber("123")).toBeNull();
  });

  it("membuat URL dengan pesan ter-encode", () => {
    const url = createWhatsAppUrl("089623080501", "Halo, saya mau pesan.");

    expect(url).toBe(
      "https://wa.me/6289623080501?text=Halo%2C%20saya%20mau%20pesan.",
    );
  });
});

describe("order produk via WhatsApp", () => {
  it("menggunakan pesan produk terpilih dan tidak memuat nilai kosong", () => {
    const product = products.find((item) => item.slug === "bibit-tanaman-toga");

    expect(product).toBeTruthy();
    const message = createProductOrderMessage(product!);

    expect(message).toContain("Produk: Bibit Tanaman TOGA");
    expect(message).toContain("Harga: Belum dikonfirmasi");
    expect(message).toContain("Jumlah: 1");
    expect(message).toContain("Mohon info ketersediaan dan cara pemesanan.");
    expect(message).not.toContain("Kategori:");
    expect(message).not.toContain("Satuan:");
    expect(message).not.toContain("Status:");
    expect(message).not.toMatch(/undefined|null/i);
  });

  it("memakai nomor fallback pusat ketika produk belum punya nomor khusus", () => {
    const product = products.find((item) => item.slug === "bibit-tanaman-toga");
    const url = createProductOrderWhatsAppUrl(product!);

    expect(url).toContain("https://wa.me/6289623080501");
    expect(new URL(url ?? "").searchParams.get("text")).toContain(
      "Produk: Bibit Tanaman TOGA",
    );
    expect(url).toContain("Produk%3A%20Bibit%20Tanaman%20TOGA");
    expect(url).toContain("%0A");
  });

  it("membedakan pesan antara dua produk", () => {
    const tea = products.find((item) => item.slug === "teh-herbal-berua");
    const ginger = products.find((item) => item.slug === "minuman-jahe-rempah");

    expect(createProductOrderMessage(tea!)).toContain("Produk: Teh Herbal Berua");
    expect(createProductOrderMessage(ginger!)).toContain(
      "Produk: Minuman Jahe Rempah",
    );
    expect(createProductOrderMessage(tea!)).not.toBe(
      createProductOrderMessage(ginger!),
    );
  });
});
