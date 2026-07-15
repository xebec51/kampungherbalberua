import type { Plant, PlantCategory } from "@/types";

export const plantCategories: PlantCategory[] = [
  "Rimpang",
  "Daun",
  "Bunga",
  "Batang",
  "Lainnya",
];

export const plants: Plant[] = [
  {
    id: "plant-jahe",
    slug: "jahe",
    localName: "Jahe",
    scientificName: "Zingiber officinale",
    otherNames: ["Ginger"],
    category: "Rimpang",
    shortDescription:
      "Rimpang aromatik yang secara tradisional digunakan untuk membantu menghangatkan tubuh.",
    description:
      "Jahe merupakan tanaman rimpang beraroma kuat yang sering dimanfaatkan dalam minuman hangat dan bumbu dapur. Informasi ini bersifat demonstrasi dan perlu diverifikasi sebelum publikasi final.",
    usedParts: ["Rimpang"],
    traditionalUses: [
      "Secara tradisional digunakan untuk membantu menghangatkan tubuh.",
      "Sering dimanfaatkan sebagai bahan minuman herbal rumahan.",
      "Dipakai sebagai bumbu yang memberi aroma pada masakan.",
    ],
    preparation: [
      "Cuci rimpang sampai bersih sebelum digunakan.",
      "Iris atau geprek rimpang, lalu seduh dengan air panas sesuai kebutuhan.",
      "Gunakan secukupnya dan hindari konsumsi berlebihan.",
    ],
    careInstructions: [
      "Tanam pada media gembur dengan drainase baik.",
      "Letakkan di area yang mendapat cahaya matahari tidak terlalu terik.",
      "Jaga media tetap lembap, bukan tergenang.",
    ],
    warnings: [
      "Pengguna obat rutin, ibu hamil, anak-anak, lansia, dan penderita penyakit tertentu perlu berkonsultasi dengan tenaga kesehatan.",
      "Informasi ini bukan pengganti diagnosis atau resep tenaga kesehatan.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: true,
    published: true,
  },
  {
    id: "plant-kunyit",
    slug: "kunyit",
    localName: "Kunyit",
    scientificName: "Curcuma longa",
    otherNames: ["Kunir"],
    category: "Rimpang",
    shortDescription:
      "Rimpang berwarna kuning yang umum digunakan sebagai bumbu dan bahan ramuan tradisional.",
    description:
      "Kunyit dikenal sebagai rimpang berwarna kuning jingga dengan aroma khas. Pemanfaatannya pada website ini ditulis sebagai edukasi pemanfaatan tradisional, bukan klaim pengobatan.",
    usedParts: ["Rimpang"],
    traditionalUses: [
      "Secara tradisional digunakan untuk membantu menjaga kebugaran.",
      "Sering menjadi bahan minuman kunyit asam.",
      "Digunakan sebagai pewarna dan bumbu alami pada masakan.",
    ],
    preparation: [
      "Kupas tipis atau sikat rimpang yang sudah dicuci bersih.",
      "Parut, iris, atau rebus sesuai resep tradisional yang tervalidasi.",
      "Hindari penggunaan berlebihan tanpa arahan tenaga kesehatan.",
    ],
    careInstructions: [
      "Gunakan media tanam yang gembur dan kaya bahan organik.",
      "Siram secukupnya saat permukaan media mulai kering.",
      "Pisahkan rimpang sehat untuk perbanyakan.",
    ],
    warnings: [
      "Orang dengan gangguan lambung, gangguan empedu, atau penggunaan obat rutin perlu berkonsultasi terlebih dahulu.",
      "Informasi ini bukan pengganti konsultasi dengan dokter, apoteker, atau tenaga kesehatan.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: true,
    published: true,
  },
  {
    id: "plant-serai",
    slug: "serai",
    localName: "Serai",
    scientificName: "Cymbopogon citratus",
    otherNames: ["Sereh", "Lemongrass"],
    category: "Batang",
    shortDescription:
      "Tanaman beraroma segar yang umum digunakan pada masakan dan seduhan tradisional.",
    description:
      "Serai memiliki batang beraroma lemon yang banyak digunakan dalam dapur rumah tangga. Informasi ini merupakan data demonstrasi untuk struktur katalog tahap pertama.",
    usedParts: ["Batang", "Daun"],
    traditionalUses: [
      "Secara tradisional digunakan untuk membantu memberi rasa hangat dan segar pada minuman.",
      "Digunakan sebagai bumbu aromatik pada masakan.",
      "Dimanfaatkan sebagai tanaman pekarangan yang mudah dirawat.",
    ],
    preparation: [
      "Cuci batang serai, buang bagian yang kering, lalu geprek.",
      "Seduh atau rebus ringan sesuai kebutuhan ramuan tradisional.",
      "Gunakan takaran wajar dan hentikan bila muncul keluhan.",
    ],
    careInstructions: [
      "Tanam rumpun serai pada area yang cukup terkena matahari.",
      "Pangkas daun tua agar rumpun tetap rapi.",
      "Siram secara teratur saat musim kering.",
    ],
    warnings: [
      "Ibu hamil, anak-anak, lansia, dan pengguna obat rutin perlu berhati-hati dan berkonsultasi bila diperlukan.",
      "Tidak semua orang cocok mengonsumsi ramuan herbal.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: true,
    published: true,
  },
  {
    id: "plant-daun-sirih",
    slug: "daun-sirih",
    localName: "Daun Sirih",
    scientificName: "Piper betle",
    otherNames: ["Sirih"],
    category: "Daun",
    shortDescription:
      "Tanaman merambat yang daunnya dikenal dalam pemanfaatan tradisional masyarakat.",
    description:
      "Daun sirih merupakan tanaman merambat yang sering ditanam di pekarangan. Penjelasan pada halaman ini perlu validasi lebih lanjut sebelum menjadi informasi publik final.",
    usedParts: ["Daun"],
    traditionalUses: [
      "Secara tradisional digunakan dalam praktik kebersihan keluarga.",
      "Dimanfaatkan sebagai tanaman pekarangan dan edukasi TOGA.",
      "Sering menjadi contoh tanaman obat keluarga di lingkungan warga.",
    ],
    preparation: [
      "Pilih daun yang bersih dan tidak rusak.",
      "Cuci dengan air mengalir sebelum digunakan.",
      "Ikuti panduan tenaga kesehatan untuk pemanfaatan yang melibatkan tubuh.",
    ],
    careInstructions: [
      "Sediakan rambatan sederhana agar tanaman tumbuh terarah.",
      "Letakkan di area teduh terang.",
      "Jaga kelembapan media dan hindari genangan.",
    ],
    warnings: [
      "Jangan digunakan pada luka, area sensitif, atau keluhan kesehatan tanpa arahan tenaga kesehatan.",
      "Informasi ini bersifat umum dan tidak menggantikan konsultasi profesional.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: false,
    published: true,
  },
  {
    id: "plant-bunga-telang",
    slug: "bunga-telang",
    localName: "Bunga Telang",
    scientificName: "Clitoria ternatea",
    otherNames: ["Telang"],
    category: "Bunga",
    shortDescription:
      "Bunga berwarna biru yang sering dimanfaatkan sebagai pewarna alami minuman.",
    description:
      "Bunga telang dikenal karena warna birunya yang menarik dan sering digunakan sebagai pewarna alami. Data ini masih demonstrasi dan belum menjadi rekomendasi kesehatan.",
    usedParts: ["Bunga"],
    traditionalUses: [
      "Secara tradisional digunakan untuk memberi warna alami pada minuman.",
      "Dimanfaatkan sebagai tanaman edukasi karena perubahan warna seduhan saat diberi bahan asam.",
      "Menjadi tanaman hias pekarangan yang mudah dikenali.",
    ],
    preparation: [
      "Gunakan bunga yang bersih dan layak konsumsi.",
      "Seduh secukupnya dengan air panas.",
      "Pastikan tidak ada pestisida atau kontaminan pada bunga yang dipakai.",
    ],
    careInstructions: [
      "Tanam pada area yang mendapat sinar matahari cukup.",
      "Sediakan rambatan agar tanaman tidak menjalar sembarangan.",
      "Pangkas ringan untuk menjaga pertumbuhan.",
    ],
    warnings: [
      "Orang dengan kondisi kesehatan tertentu perlu berkonsultasi sebelum konsumsi rutin.",
      "Pastikan bahan berasal dari tanaman yang aman dan bersih.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: true,
    published: true,
  },
  {
    id: "plant-temulawak",
    slug: "temulawak",
    localName: "Temulawak",
    scientificName: "Curcuma xanthorrhiza",
    otherNames: ["Javanese turmeric"],
    category: "Rimpang",
    shortDescription:
      "Rimpang khas Indonesia yang umum dikenalkan dalam edukasi tanaman obat keluarga.",
    description:
      "Temulawak merupakan tanaman rimpang yang sering dikaitkan dengan tradisi jamu Indonesia. Informasi ini disediakan sebagai contoh struktur data dan menunggu verifikasi.",
    usedParts: ["Rimpang"],
    traditionalUses: [
      "Secara tradisional digunakan untuk membantu menjaga kebugaran.",
      "Sering diperkenalkan dalam edukasi jamu keluarga.",
      "Digunakan sebagai bahan ramuan tradisional dengan takaran terbatas.",
    ],
    preparation: [
      "Cuci rimpang hingga bersih sebelum diolah.",
      "Iris tipis atau rebus ringan sesuai panduan ramuan yang tervalidasi.",
      "Hindari konsumsi jangka panjang tanpa konsultasi tenaga kesehatan.",
    ],
    careInstructions: [
      "Tanam pada tanah gembur dengan kelembapan cukup.",
      "Berikan ruang agar rumpun rimpang dapat berkembang.",
      "Panen hanya setelah tanaman cukup umur.",
    ],
    warnings: [
      "Pengguna obat rutin dan orang dengan gangguan hati atau empedu perlu berkonsultasi dengan tenaga kesehatan.",
      "Ramuan tradisional tidak menggantikan terapi medis.",
    ],
    image: "/images/placeholders/plant.svg",
    locationStatus: "Lokasi tanaman sedang dipetakan.",
    source: "Data demonstrasi berdasarkan pengetahuan umum tanaman TOGA.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    featured: false,
    published: true,
  },
];

export function getPlantBySlug(slug: string) {
  return plants.find((plant) => plant.slug === slug && plant.published);
}

export const featuredPlants = plants.filter(
  (plant) => plant.featured && plant.published,
);
