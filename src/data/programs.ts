import type { Program } from "@/types";

export const programs: Program[] = [
  {
    id: "program-penataan-kebun-toga",
    slug: "penataan-kebun-toga",
    title: "Penataan Kebun TOGA",
    category: "Lingkungan",
    description:
      "Program penataan area tanaman obat keluarga agar lebih mudah dirawat, dikenali, dan dikembangkan sebagai ruang edukasi warga.",
    status: "ongoing",
    progress: null,
    startDate: null,
    endDate: null,
    image: "/images/placeholders/activity.svg",
    featured: true,
  },
  {
    id: "program-workshop-ramuan-sehat",
    slug: "workshop-ramuan-sehat",
    title: "Workshop Ramuan Sehat",
    category: "Edukasi kesehatan",
    description:
      "Kegiatan edukasi pemanfaatan tradisional tanaman herbal dengan pendekatan aman dan menunggu verifikasi tenaga kesehatan.",
    status: "planned",
    progress: null,
    startDate: null,
    endDate: null,
    image: "/images/placeholders/activity.svg",
    featured: true,
  },
  {
    id: "program-pendataan-herbacode",
    slug: "pendataan-tanaman-herbacode",
    title: "Pendataan Tanaman HerbaCode",
    category: "Digitalisasi",
    description:
      "Pendataan tanaman TOGA untuk disiapkan sebagai halaman digital dan QR Code setelah data diverifikasi.",
    status: "ongoing",
    progress: null,
    startDate: null,
    endDate: null,
    image: "/images/placeholders/activity.svg",
    featured: true,
  },
  {
    id: "program-pemetaan-kampung-herbal",
    slug: "pemetaan-kampung-herbal",
    title: "Pemetaan Kampung Herbal",
    category: "Pemetaan wilayah",
    description:
      "Penyusunan denah dan lapisan informasi wilayah bersama tim Perencanaan Wilayah dan Kota.",
    status: "ongoing",
    progress: null,
    startDate: null,
    endDate: null,
    image: "/images/placeholders/map.svg",
    featured: true,
  },
];

export const featuredPrograms = programs.filter((program) => program.featured);
