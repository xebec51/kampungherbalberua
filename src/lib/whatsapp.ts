import type { Product } from "@/types";
import { productOrderContact } from "@/config/contacts";
import { formatPrice, getAvailabilityLabel } from "@/lib/formatters";

type ProductOrderDetails = Pick<
  Product,
  | "availability"
  | "category"
  | "name"
  | "price"
  | "unit"
  | "whatsappNumber"
>;

export function normalizeWhatsAppNumber(phoneNumber: string | null) {
  const digits = phoneNumber?.replace(/\D/g, "") ?? "";

  if (!digits || digits.length < 8) {
    return null;
  }

  if (digits.startsWith("62")) {
    return digits;
  }

  if (digits.startsWith("0")) {
    return `62${digits.slice(1)}`;
  }

  if (digits.startsWith("8")) {
    return `62${digits}`;
  }

  return digits;
}

export function createWhatsAppUrl(phoneNumber: string | null, message: string) {
  const normalizedNumber = normalizeWhatsAppNumber(phoneNumber);

  if (!normalizedNumber) {
    return null;
  }

  return `https://wa.me/${normalizedNumber}?text=${encodeURIComponent(message)}`;
}

export function createProductOrderMessage(
  product: Pick<Product, "availability" | "category" | "name" | "price" | "unit">,
) {
  return [
    "Halo, saya ingin bertanya mengenai produk Kampung Herbal Harmony Berua.",
    "",
    `Produk: ${product.name}`,
    `Kategori: ${product.category}`,
    `Harga: ${formatPrice(product.price, null)}`,
    `Satuan: ${product.unit ?? "Belum dikonfirmasi"}`,
    `Status: ${getAvailabilityLabel(product.availability)}`,
    "Jumlah yang diinginkan: 1",
    "",
    "Mohon informasi mengenai ketersediaan, harga final, serta cara pengambilan atau pengiriman. Terima kasih.",
  ].join("\n");
}

export function createProductOrderWhatsAppUrl(product: ProductOrderDetails) {
  return createWhatsAppUrl(
    product.whatsappNumber ?? productOrderContact.whatsappNumber,
    createProductOrderMessage(product),
  );
}
