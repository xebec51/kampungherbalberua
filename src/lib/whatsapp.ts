import type { Product } from "@/types";
import { productOrderContact } from "@/config/contacts";

type ProductOrderDetails = Pick<Product, "name" | "whatsappNumber">;

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

export function createProductOrderMessage(product: Pick<Product, "name">) {
  return `Halo, saya ingin bertanya atau memesan ${product.name} dari Kampung Herbal Berua.`;
}

export function createProductOrderWhatsAppUrl(product: ProductOrderDetails) {
  return createWhatsAppUrl(
    product.whatsappNumber ?? productOrderContact.whatsappNumber,
    createProductOrderMessage(product),
  );
}
