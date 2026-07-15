import type { Recipe } from "@/types";

export const recipes: Recipe[] = [
  {
    id: "recipe-wedang-jahe",
    slug: "wedang-jahe",
    name: "Wedang Jahe",
    shortDescription:
      "Minuman hangat berbahan jahe yang secara tradisional digunakan untuk membantu memberi rasa nyaman saat cuaca dingin.",
    traditionalPurpose:
      "Secara tradisional digunakan untuk membantu menghangatkan tubuh dan memberi sensasi nyaman.",
    ingredients: [
      { name: "Jahe segar", amount: "2 ruas kecil" },
      { name: "Air", amount: "300 ml" },
      { name: "Gula merah atau madu", amount: "Secukupnya, opsional" },
    ],
    steps: [
      "Cuci jahe sampai bersih, lalu geprek.",
      "Rebus air dan jahe dengan api kecil selama beberapa menit.",
      "Saring, lalu tambahkan pemanis secukupnya bila diperlukan.",
      "Sajikan hangat.",
    ],
    servingSuggestion:
      "Diminum hangat dalam porsi wajar. Tidak disarankan sebagai pengganti obat atau terapi dari tenaga kesehatan.",
    warnings: [
      "Konsultasikan dengan tenaga kesehatan bila sedang hamil, menyusui, memiliki penyakit tertentu, atau menggunakan obat rutin.",
      "Hentikan penggunaan bila muncul keluhan yang tidak nyaman.",
    ],
    image: "/images/placeholders/recipe.svg",
    author: "Data demonstrasi program ramuan sehat.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    published: true,
  },
  {
    id: "recipe-kunyit-asam",
    slug: "kunyit-asam",
    name: "Kunyit Asam",
    shortDescription:
      "Ramuan tradisional berbahan kunyit dan asam yang perlu takaran bijak dan verifikasi sebelum publikasi final.",
    traditionalPurpose:
      "Secara tradisional digunakan untuk membantu menjaga kebugaran dengan cita rasa asam segar.",
    ingredients: [
      { name: "Kunyit segar", amount: "1-2 ruas kecil" },
      { name: "Asam jawa", amount: "Secukupnya" },
      { name: "Air", amount: "400 ml" },
      { name: "Gula merah", amount: "Secukupnya, opsional" },
    ],
    steps: [
      "Cuci kunyit hingga bersih, lalu iris tipis atau parut.",
      "Rebus kunyit bersama air dengan api kecil.",
      "Tambahkan asam jawa dan pemanis secukupnya.",
      "Saring dan sajikan dalam keadaan hangat atau suhu ruang.",
    ],
    servingSuggestion:
      "Gunakan porsi kecil dan tidak dikonsumsi berlebihan. Informasi takaran perlu diverifikasi sebelum dipublikasikan sebagai panduan final.",
    warnings: [
      "Tidak disarankan untuk mengganti obat dokter dengan ramuan ini.",
      "Orang dengan gangguan lambung, empedu, penyakit tertentu, atau penggunaan obat rutin perlu berkonsultasi dahulu.",
    ],
    image: "/images/placeholders/recipe.svg",
    author: "Data demonstrasi program ramuan sehat.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    published: true,
  },
  {
    id: "recipe-seduhan-serai",
    slug: "seduhan-serai",
    name: "Seduhan Serai",
    shortDescription:
      "Seduhan sederhana berbahan serai untuk contoh edukasi pemanfaatan tradisional tanaman pekarangan.",
    traditionalPurpose:
      "Secara tradisional digunakan untuk membantu memberi aroma segar dan rasa hangat pada minuman.",
    ingredients: [
      { name: "Batang serai", amount: "1 batang" },
      { name: "Air panas", amount: "250-300 ml" },
      { name: "Jeruk nipis atau madu", amount: "Opsional" },
    ],
    steps: [
      "Cuci serai, buang bagian kering, lalu geprek batangnya.",
      "Masukkan ke gelas atau teko kecil.",
      "Tuang air panas dan diamkan beberapa menit.",
      "Saring bila perlu, lalu sajikan hangat.",
    ],
    servingSuggestion:
      "Diminum hangat sebagai minuman tradisional rumahan dengan porsi wajar.",
    warnings: [
      "Konsultasikan dengan tenaga kesehatan untuk anak-anak, ibu hamil, lansia, atau pengguna obat rutin.",
      "Pastikan bahan bersih dan tidak terkontaminasi pestisida.",
    ],
    image: "/images/placeholders/recipe.svg",
    author: "Data demonstrasi program ramuan sehat.",
    validator: "Menunggu verifikasi tim Farmasi atau tenaga kesehatan.",
    validationStatus: "data-demonstrasi",
    published: true,
  },
];

export function getRecipeBySlug(slug: string) {
  return recipes.find((recipe) => recipe.slug === slug && recipe.published);
}
