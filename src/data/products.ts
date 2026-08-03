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
 * - benefits: klaim manfaat dari katalog produk, dihaluskan jadi "membantu/mendukung"
 *   (bukan pernyataan pasti) supaya konsisten dengan gaya manfaat HerbaCode lainnya.
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
    benefits: [
      "Membantu melancarkan peredaran darah.",
      "Membantu mencegah infeksi ringan.",
      "Membantu mengurangi peradangan.",
      "Membantu meningkatkan kekebalan tubuh.",
      "Mendukung kesehatan pencernaan dan reproduksi.",
      "Menjadi sumber antioksidan.",
    ],
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
    benefits: [
      "Membantu meningkatkan daya tahan tubuh.",
      "Mendukung kesehatan sistem kardiovaskuler.",
      "Menjadi sumber antioksidan.",
      "Membantu meringankan batuk berdahak.",
      "Membantu meningkatkan nafsu makan anak.",
      "Membantu meringankan gangguan pencernaan.",
      "Membantu meringankan stres.",
    ],
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
    benefits: [
      "Menjadi sumber antioksidan.",
      "Mendukung kesehatan otak.",
      "Membantu menenangkan dan meredakan stres.",
      "Membantu mencegah gangguan pencernaan.",
      "Membantu meringankan kadar kolesterol.",
      "Membantu mencegah penuaan dini.",
      "Mendukung kesehatan kulit.",
      "Membantu mengatasi sembelit.",
    ],
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
    benefits: [
      "Menjadi sumber antioksidan.",
      "Membantu meningkatkan stamina.",
      "Membantu mencegah peningkatan kolesterol.",
      "Membantu mencegah anemia.",
      "Mendukung produksi ASI.",
    ],
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
    benefits: [
      "Membantu meningkatkan vitalitas.",
      "Membantu melancarkan peredaran darah.",
      "Membantu meredakan gangguan pencernaan.",
      "Membantu meredakan gejala asam urat.",
      "Membantu meredakan pegal linu.",
      "Mendukung kesehatan tulang.",
      "Menjadi sumber antioksidan.",
    ],
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
    benefits: [
      "Membantu melancarkan peredaran darah.",
      "Membantu meredakan masuk angin dan gejala flu atau batuk.",
      "Membantu meningkatkan vitalitas.",
      "Membantu meningkatkan kekebalan tubuh.",
      "Membantu meredakan nyeri haid.",
      "Membantu meredakan nyeri kepala.",
      "Mendukung kesehatan pencernaan.",
    ],
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
    benefits: [],
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
    benefits: [],
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
