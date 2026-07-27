import { describe, expect, it } from "vitest";
import {
  createProductOrderMessage,
  createProductOrderWhatsAppUrl,
  createWhatsAppUrl,
  normalizeWhatsAppNumber,
} from "@/lib/whatsapp";

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
  it("menggunakan pesan order produk yang konsisten", () => {
    expect(createProductOrderMessage({ name: "Bibit Tanaman TOGA" })).toBe(
      "Halo, saya ingin bertanya atau memesan Bibit Tanaman TOGA dari Kampung Herbal Berua.",
    );
  });

  it("memakai nomor fallback pusat ketika produk belum punya nomor khusus", () => {
    const url = createProductOrderWhatsAppUrl({
      name: "Bibit Tanaman TOGA",
      whatsappNumber: null,
    });

    expect(url).toContain("https://wa.me/6289623080501");
    expect(new URL(url ?? "").searchParams.get("text")).toBe(
      "Halo, saya ingin bertanya atau memesan Bibit Tanaman TOGA dari Kampung Herbal Berua.",
    );
  });
});
