import type { Product } from "@/types";
import { productOrderContact } from "@/config/contacts";
import { formatPrice } from "@/lib/formatters";

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
  product: Pick<Product, "name" | "price">,
) {
  return [
    "Halo, saya ingin bertanya tentang produk Kampung Herbal Harmony Berua.",
    "",
    `Produk: ${product.name}`,
    `Harga: ${formatPrice(product.price, null)}`,
    "Jumlah: 1",
    "",
    "Mohon info ketersediaan dan cara pemesanan. Terima kasih.",
  ].join("\n");
}

export function createProductOrderWhatsAppUrl(product: ProductOrderDetails) {
  return createWhatsAppUrl(
    product.whatsappNumber ?? productOrderContact.whatsappNumber,
    createProductOrderMessage(product),
  );
}
