import type { HealthCondition } from "@/types";

// Local fallback mirroring supabase/migrations/20260810160400_create_health_conditions.sql --
// kept manually in sync with the migration seed, same convention as every
// other public entity's static fallback in this codebase.
export const healthConditions: HealthCondition[] = [
  {
    id: "health-condition-hiperkolesterolemia",
    slug: "hiperkolesterolemia",
    name: "Hiperkolesterolemia",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar kolesterol tetap seimbang.",
    description:
      "Hiperkolesterolemia adalah kondisi kadar kolesterol dalam darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan jantung dan pembuluh darah.",
    benefits: ["Membantu menjaga kadar kolesterol normal", "Kaya antioksidan", "Mendukung kesehatan jantung"],
    sortOrder: 1,
    linkedPlants: [
      { displayName: "Bawang Putih", plantSlug: "bawang-putih" },
      { displayName: "Daun Salam", plantSlug: "daun-salam" },
      { displayName: "Kelor", plantSlug: "kelor" },
      { displayName: "Rosella", plantSlug: "rosella" },
      { displayName: "Pegagan", plantSlug: "pegagan" },
      { displayName: "Jati Belanda", plantSlug: "jati-belanda" },
      { displayName: "Teh Hijau", plantSlug: "teh-hijau" },
      { displayName: "Alpukat", plantSlug: "alpukat" },
    ],
  },
  {
    id: "health-condition-diabetes-melitus",
    slug: "diabetes-melitus",
    name: "Diabetes Melitus",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar gula darah.",
    description:
      "Diabetes Melitus adalah kondisi kadar gula darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung sensitivitas insulin tubuh.",
    benefits: ["Membantu menjaga gula darah", "Mendukung sensitivitas insulin"],
    sortOrder: 2,
    linkedPlants: [
      { displayName: "Pare", plantSlug: "pare" },
      { displayName: "Brotowali", plantSlug: "brotowali" },
      { displayName: "Salam", plantSlug: "daun-salam" },
      { displayName: "Sambiloto", plantSlug: "sambiloto" },
      { displayName: "Kayu Manis", plantSlug: "kayu-manis" },
      { displayName: "Mahkota Dewa", plantSlug: "mahkota-dewa" },
      { displayName: "Kelor", plantSlug: "kelor" },
      { displayName: "Mengkudu", plantSlug: "mengkudu" },
    ],
  },
  {
    id: "health-condition-gastritis-maag",
    slug: "gastritis-maag",
    name: "Gastritis (Maag)",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu kenyamanan lambung.",
    description:
      "Gastritis atau maag adalah peradangan pada lapisan lambung. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan saluran cerna.",
    benefits: ["Membantu kenyamanan lambung", "Mendukung kesehatan saluran cerna"],
    sortOrder: 3,
    linkedPlants: [
      { displayName: "Kunyit", plantSlug: "kunyit" },
      { displayName: "Temulawak", plantSlug: "temulawak" },
      { displayName: "Lidah Buaya", plantSlug: "lidah-buaya" },
      { displayName: "Cincau Hijau", plantSlug: "cincau-hijau" },
      { displayName: "Daun Jambu", plantSlug: "daun-jambu" },
      { displayName: "Adas", plantSlug: "adas" },
      { displayName: "Pepaya", plantSlug: "pepaya" },
      { displayName: "Madu Herbal", plantSlug: null },
    ],
  },
  {
    id: "health-condition-demam",
    slug: "demam",
    name: "Demam",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga daya tahan tubuh saat demam.",
    description:
      "Demam adalah kenaikan suhu tubuh yang umumnya menyertai infeksi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung pemulihan tubuh.",
    benefits: ["Membantu menjaga daya tahan tubuh", "Mendukung pemulihan saat demam"],
    sortOrder: 4,
    linkedPlants: [
      { displayName: "Meniran", plantSlug: "meniran" },
      { displayName: "Sambiloto", plantSlug: "sambiloto" },
      { displayName: "Daun Pepaya", plantSlug: "pepaya" },
      { displayName: "Rosella", plantSlug: "rosella" },
      { displayName: "Temulawak", plantSlug: "temulawak" },
      { displayName: "Kunyit", plantSlug: "kunyit" },
      { displayName: "Pegagan", plantSlug: "pegagan" },
      { displayName: "Bunga Telang", plantSlug: "bunga-telang" },
    ],
  },
  {
    id: "health-condition-diare",
    slug: "diare",
    name: "Diare",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu mengurangi frekuensi buang air besar.",
    description:
      "Diare adalah kondisi buang air besar dengan frekuensi tinggi dan konsistensi cair. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan usus.",
    benefits: ["Membantu mengurangi frekuensi BAB", "Mendukung kesehatan usus"],
    sortOrder: 5,
    linkedPlants: [
      { displayName: "Daun Jambu Biji", plantSlug: "daun-jambu" },
      { displayName: "Kunyit", plantSlug: "kunyit" },
      { displayName: "Temulawak", plantSlug: "temulawak" },
      { displayName: "Daun Salam", plantSlug: "daun-salam" },
      { displayName: "Sambiloto", plantSlug: "sambiloto" },
      { displayName: "Meniran", plantSlug: "meniran" },
      { displayName: "Gambir", plantSlug: "gambir" },
      { displayName: "Teh Hijau", plantSlug: "teh-hijau" },
    ],
  },
  {
    id: "health-condition-hiperurisemia-asam-urat",
    slug: "hiperurisemia-asam-urat",
    name: "Hiperurisemia (Asam Urat)",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga kadar asam urat.",
    description:
      "Hiperurisemia atau asam urat adalah kondisi kadar asam urat dalam darah yang tinggi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung fungsi ginjal.",
    benefits: ["Membantu menjaga kadar asam urat", "Mendukung fungsi ginjal"],
    sortOrder: 6,
    linkedPlants: [
      { displayName: "Sidaguri", plantSlug: "sidaguri" },
      { displayName: "Kumis Kucing", plantSlug: "kumis-kucing" },
      { displayName: "Tempuyung", plantSlug: "tempuyung" },
      { displayName: "Seledri", plantSlug: "seledri" },
      { displayName: "Daun Salam", plantSlug: "daun-salam" },
      { displayName: "Meniran", plantSlug: "meniran" },
      { displayName: "Sambiloto", plantSlug: "sambiloto" },
      { displayName: "Jahe", plantSlug: "jahe" },
    ],
  },
  {
    id: "health-condition-alergi",
    slug: "alergi",
    name: "Alergi",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga respons imun tubuh.",
    description:
      "Alergi adalah reaksi berlebihan sistem imun terhadap suatu zat. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional karena kandungan antioksidannya.",
    benefits: ["Membantu menjaga respons imun tubuh", "Kaya antioksidan"],
    sortOrder: 7,
    linkedPlants: [
      { displayName: "Meniran", plantSlug: "meniran" },
      { displayName: "Pegagan", plantSlug: "pegagan" },
      { displayName: "Daun Ungu", plantSlug: "daun-ungu" },
      { displayName: "Sambung Nyawa", plantSlug: "sambung-nyawa" },
      { displayName: "Kelor", plantSlug: "kelor" },
      { displayName: "Rosella", plantSlug: "rosella" },
      { displayName: "Temu Putih", plantSlug: "temu-putih" },
      { displayName: "Bunga Telang", plantSlug: "bunga-telang" },
    ],
  },
  {
    id: "health-condition-hipertensi",
    slug: "hipertensi",
    name: "Hipertensi",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu menjaga tekanan darah tetap normal.",
    description:
      "Hipertensi adalah kondisi tekanan darah yang tinggi secara terus-menerus. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kesehatan pembuluh darah.",
    benefits: ["Membantu menjaga tekanan darah normal", "Mendukung kesehatan pembuluh darah"],
    sortOrder: 8,
    linkedPlants: [
      { displayName: "Seledri", plantSlug: "seledri" },
      { displayName: "Kumis Kucing", plantSlug: "kumis-kucing" },
      { displayName: "Rosella", plantSlug: "rosella" },
      { displayName: "Belimbing Wuluh", plantSlug: "belimbing-wuluh" },
      { displayName: "Bawang Putih", plantSlug: "bawang-putih" },
      { displayName: "Pegagan", plantSlug: "pegagan" },
      { displayName: "Salam", plantSlug: "daun-salam" },
      { displayName: "Tempuyung", plantSlug: "tempuyung" },
    ],
  },
  {
    id: "health-condition-common-cold-pilek-batuk",
    slug: "common-cold-pilek-batuk",
    name: "Common Cold (Pilek dan Batuk)",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk membantu melegakan pernapasan saat pilek dan batuk.",
    description:
      "Common cold adalah infeksi saluran pernapasan ringan yang umum terjadi. Tanaman pada kategori ini dikenal dalam kebiasaan pemanfaatan tradisional untuk mendukung kenyamanan bernapas.",
    benefits: ["Membantu melegakan pernapasan", "Membantu mengurangi batuk"],
    sortOrder: 9,
    linkedPlants: [
      { displayName: "Jahe", plantSlug: "jahe" },
      { displayName: "Kencur", plantSlug: "kencur" },
      { displayName: "Jeruk Nipis", plantSlug: "jeruk-nipis" },
      { displayName: "Sirih", plantSlug: "daun-sirih" },
      { displayName: "Kayu Putih", plantSlug: "kayu-putih" },
      { displayName: "Saga", plantSlug: "saga" },
      { displayName: "Adas", plantSlug: "adas" },
      { displayName: "Lempuyang", plantSlug: "lempuyang" },
    ],
  },
  {
    id: "health-condition-obat-luka",
    slug: "obat-luka",
    name: "Obat Luka",
    shortDescription:
      "Kumpulan tanaman yang secara tradisional dimanfaatkan untuk mendukung perawatan luka ringan.",
    description:
      "Perawatan luka secara tradisional memanfaatkan berbagai tanaman untuk mendukung proses pemulihan kulit. Tanaman pada kategori ini dikenal dalam kebiasaan perawatan luar rumahan.",
    benefits: ["Mendukung penyembuhan luka", "Membantu regenerasi jaringan"],
    sortOrder: 10,
    linkedPlants: [
      { displayName: "Binahong", plantSlug: "binahong" },
      { displayName: "Pegagan", plantSlug: "pegagan" },
      { displayName: "Daun Jarak", plantSlug: "daun-jarak" },
      { displayName: "Sambung Nyawa", plantSlug: "sambung-nyawa" },
      { displayName: "Daun Ungu", plantSlug: "daun-ungu" },
      { displayName: "Lidah Buaya", plantSlug: "lidah-buaya" },
      { displayName: "Yodium", plantSlug: null },
      { displayName: "Tapak Liman", plantSlug: "tapak-liman" },
    ],
  },
];
