import type { Product } from "@/types";

const ramuankuProducerName = "Ramuanku";
const kknProducerName = "Kampung Herbal Harmony Berua";

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
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Racikan bubuk empon-empon dari temulawak, jahe merah, dan kunyit, diseduh sebagai teh hangat sehari-hari untuk menjaga daya tahan tubuh dan pencernaan.",
    featured: true,
    id: "product-empon-empon",
    image: "/images/products/empon-empon.jpg",
    name: "Empon-Empon",
    price: null,
    producerName: ramuankuProducerName,
    slug: "empon-empon",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Bubuk beras kencur dengan campuran jahe dan kunyit, diseduh hangat untuk menjaga daya tahan tubuh dan meredakan batuk berdahak.",
    featured: false,
    id: "product-beras-kencur",
    image: "/images/products/beras-kencur.jpg",
    name: "Beras Kencur",
    price: null,
    producerName: ramuankuProducerName,
    slug: "beras-kencur",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Teh bubuk dari kelopak bunga telang dan rempah pilihan, menghasilkan seduhan ungu yang kaya antioksidan dan menenangkan.",
    featured: true,
    id: "product-bunga-telang-rempah",
    image: "/images/products/bunga-telang-rempah.jpg",
    name: "Bunga Telang Rempah",
    price: null,
    producerName: ramuankuProducerName,
    slug: "bunga-telang-rempah",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Bubuk daun kelor dicampur rempah hangat, diseduh sebagai teh harian untuk menjaga stamina dan kadar kolesterol.",
    featured: true,
    id: "product-kelor-rempah",
    image: "/images/products/kelor-rempah.jpg",
    name: "Kelor Rempah",
    price: null,
    producerName: ramuankuProducerName,
    slug: "kelor-rempah",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Teh bubuk kayu secang berpadu jahe dan rempah lain, diseduh hangat untuk melancarkan peredaran darah dan meredakan pegal linu.",
    featured: false,
    id: "product-secang-rempah",
    image: "/images/products/secang-rempah.jpg",
    name: "Secang Rempah",
    price: null,
    producerName: ramuankuProducerName,
    slug: "secang-rempah",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Minuman herbal",
    description:
      "Teh bubuk jahe merah dengan kayu manis dan rempah hangat lain, diseduh untuk meredakan masuk angin dan menjaga daya tahan tubuh.",
    featured: true,
    id: "product-jahe-rempah",
    image: "/images/products/jahe-rempah.jpg",
    name: "Jahe Rempah",
    price: null,
    producerName: ramuankuProducerName,
    slug: "jahe-rempah",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Perawatan rumah tangga",
    description:
      "Sabun cair dari fermentasi limbah dapur (eco-enzyme), diproses warga menjadi pembersih alami yang ramah lingkungan.",
    featured: false,
    id: "product-ecoenzym-soap",
    image: "/images/products/ecoenzym-soap.jpg",
    name: "EcoEnzym Soap",
    price: null,
    producerName: kknProducerName,
    slug: "ecoenzym-soap",
    unit: null,
    whatsappNumber: null,
  },
  {
    availability: "tersedia",
    category: "Bahan herbal",
    description:
      "Bubuk jahe murni tanpa bahan tambahan, siap diseduh sebagai minuman hangat atau dicampur ke masakan sehari-hari.",
    featured: false,
    id: "product-jahe-bubuk",
    image: "/images/products/jahe-bubuk.jpg",
    name: "Jahe Bubuk",
    price: null,
    producerName: ramuankuProducerName,
    slug: "jahe-bubuk",
    unit: null,
    whatsappNumber: null,
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export const featuredProducts = products.filter((product) => product.featured);
