import type { Product } from "@/types";

export const sampleProductNotice =
  "Data produk, harga, stok, kemasan, dan produsen masih menunggu konfirmasi pengelola Kampung Herbal Harmony Berua.";

const sampleProducerName = "Kampung Herbal Harmony Berua — data contoh";

/**
 * Field produk:
 * - id: identitas stabil untuk React key dan referensi internal.
 * - slug: path URL publik, harus unik dan tidak berubah tanpa kebutuhan.
 * - name: nama produk yang tampil kepada pengunjung.
 * - category: kelompok produk ringkas untuk filter/kartu.
 * - description: deskripsi netral tanpa klaim menyembuhkan.
 * - price: harga dalam rupiah; null bila belum dikonfirmasi.
 * - unit: satuan jual; null bila belum dikonfirmasi.
 * - image: path aset lokal atau string kosong untuk fallback visual.
 * - producerName: nama produsen/pengelola yang sudah terkonfirmasi.
 * - whatsappNumber: nomor khusus produk; null memakai kontak global.
 * - availability: status stok untuk CTA dan label publik.
 * - featured: tampil pada bagian produk unggulan di beranda.
 */
export const products: Product[] = [
  {
    availability: "segera-tersedia",
    category: "Minuman herbal",
    description:
      "Contoh produk teh herbal untuk menguji tampilan katalog dan alur tanya produk melalui WhatsApp.",
    featured: true,
    id: "sample-product-teh-herbal-berua",
    image: "/images/products/examples/teh-herbal-berua.webp",
    name: "Teh Herbal Berua",
    price: null,
    producerName: sampleProducerName,
    slug: "teh-herbal-berua",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "segera-tersedia",
    category: "Minuman herbal",
    description:
      "Contoh minuman jahe dan rempah untuk pratinjau produk kemasan tanpa klaim kesehatan khusus.",
    featured: true,
    id: "sample-product-minuman-jahe-rempah",
    image: "/images/products/examples/minuman-jahe-rempah.webp",
    name: "Minuman Jahe Rempah",
    price: null,
    producerName: sampleProducerName,
    slug: "minuman-jahe-rempah",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "segera-tersedia",
    category: "Minuman herbal",
    description:
      "Contoh katalog kunyit asam untuk menyiapkan layout informasi produk, harga, satuan, dan pemesanan.",
    featured: true,
    id: "sample-product-kunyit-asam",
    image: "/images/products/examples/kunyit-asam.webp",
    name: "Kunyit Asam",
    price: null,
    producerName: sampleProducerName,
    slug: "kunyit-asam",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "segera-tersedia",
    category: "Bahan herbal",
    description:
      "Contoh simplisia kering untuk menguji tampilan produk bahan herbal yang belum memiliki detail kemasan resmi.",
    featured: false,
    id: "sample-product-simplisia-herbal-kering",
    image: "/images/products/examples/simplisia-herbal-kering.webp",
    name: "Simplisia Herbal Kering",
    price: null,
    producerName: sampleProducerName,
    slug: "simplisia-herbal-kering",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "segera-tersedia",
    category: "Bibit tanaman",
    description:
      "Contoh bibit tanaman TOGA untuk menyiapkan alur katalog tanaman hidup dan pertanyaan ketersediaan.",
    featured: true,
    id: "sample-product-bibit-tanaman-toga",
    image: "/images/products/examples/bibit-tanaman-toga.webp",
    name: "Bibit Tanaman TOGA",
    price: null,
    producerName: sampleProducerName,
    slug: "bibit-tanaman-toga",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "segera-tersedia",
    category: "Paket tanaman",
    description:
      "Contoh paket tanaman herbal rumah untuk menguji detail produk bundel sebelum katalog resmi diterima.",
    featured: false,
    id: "sample-product-paket-tanaman-herbal-rumah",
    image: "/images/products/examples/paket-tanaman-herbal-rumah.webp",
    name: "Paket Tanaman Herbal Rumah",
    price: null,
    producerName: sampleProducerName,
    slug: "paket-tanaman-herbal-rumah",
    unit: null,
    whatsappNumber: null,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const featuredProducts = products.filter((product) => product.featured);
