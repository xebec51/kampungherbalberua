import type { Product } from "@/types";

export const products: Product[] = [
  {
    id: "product-bibit-toga",
    slug: "bibit-tanaman-toga",
    name: "Bibit Tanaman TOGA",
    category: "Bibit tanaman",
    description:
      "Contoh katalog bibit tanaman obat keluarga yang nantinya dapat diisi berdasarkan produk warga yang sudah terdata.",
    price: null,
    unit: "per polybag",
    image: "/images/placeholders/product.svg",
    producerName: "Warga Kampung Herbal Berua",
    whatsappNumber: null,
    availability: "segera-tersedia",
    featured: true,
  },
  {
    id: "product-minuman-herbal",
    slug: "minuman-herbal",
    name: "Minuman Herbal",
    category: "Minuman",
    description:
      "Ruang awal produk minuman herbal warga. Detail komposisi, izin, harga, dan kontak akan ditambahkan setelah pendataan.",
    price: null,
    unit: "per botol",
    image: "/images/placeholders/product.svg",
    producerName: "Warga Kampung Herbal Berua",
    whatsappNumber: null,
    availability: "segera-tersedia",
    featured: true,
  },
  {
    id: "product-paket-tanaman-pot",
    slug: "paket-tanaman-dalam-pot",
    name: "Paket Tanaman Dalam Pot",
    category: "Tanaman pot",
    description:
      "Contoh paket tanaman pekarangan untuk kunjungan edukasi atau kebutuhan rumah tangga. Informasi produk masih dilengkapi.",
    price: null,
    unit: "per paket",
    image: "/images/placeholders/product.svg",
    producerName: "Warga Kampung Herbal Berua",
    whatsappNumber: null,
    availability: "segera-tersedia",
    featured: true,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const featuredProducts = products.filter((product) => product.featured);
