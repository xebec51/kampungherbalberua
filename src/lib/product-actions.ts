import type { Product } from "@/types";
import { createProductOrderWhatsAppUrl } from "@/lib/whatsapp";

type ProductWhatsAppAction =
  | {
      disabled: false;
      href: string;
      label: "Pesan via WhatsApp" | "Tanyakan via WhatsApp";
    }
  | {
      disabled: true;
      href: null;
      label: "Kontak segera tersedia" | "Stok habis";
    };

export function getProductWhatsAppAction(product: Product): ProductWhatsAppAction {
  if (product.availability === "habis") {
    return {
      disabled: true,
      href: null,
      label: "Stok habis",
    };
  }

  const href = createProductOrderWhatsAppUrl(product);

  if (!href) {
    return {
      disabled: true,
      href: null,
      label: "Kontak segera tersedia",
    };
  }

  return {
    disabled: false,
    href,
    label:
      product.availability === "segera-tersedia"
        ? "Tanyakan via WhatsApp"
        : "Pesan via WhatsApp",
  };
}

export function isSampleProduct(product: Product) {
  return product.producerName.toLocaleLowerCase("id").includes("data contoh");
}
