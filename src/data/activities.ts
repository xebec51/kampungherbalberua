import type { Activity } from "@/types";

export const activities: Activity[] = [
  {
    id: "activity-pendataan-tanaman",
    slug: "pendataan-tanaman",
    title: "Pendataan Tanaman",
    category: "HerbaCode",
    description:
      "Kegiatan awal untuk menampilkan alur dokumentasi pendataan tanaman. Foto dan tanggal asli akan diperbarui dari dokumentasi lapangan.",
    dateLabel: "Dokumentasi awal",
    image: "/images/placeholders/activity.svg",
    featured: true,
  },
  {
    id: "activity-penataan-kebun-toga",
    slug: "penataan-kebun-toga",
    title: "Penataan Kebun TOGA",
    category: "Lingkungan",
    description:
      "Contoh dokumentasi penataan area tanaman obat keluarga. Informasi final menunggu arsip kegiatan lapangan.",
    dateLabel: "Dokumentasi awal",
    image: "/images/placeholders/activity.svg",
    featured: true,
  },
  {
    id: "activity-workshop-ramuan",
    slug: "workshop-ramuan",
    title: "Workshop Ramuan",
    category: "Farmasi",
    description:
      "Placeholder dokumentasi edukasi ramuan sehat. Materi akan disesuaikan dengan hasil validasi tim Farmasi.",
    dateLabel: "Dokumentasi awal",
    image: "/images/placeholders/recipe.svg",
    featured: true,
  },
  {
    id: "activity-pemetaan-kampung",
    slug: "pemetaan-kampung",
    title: "Pemetaan Kampung",
    category: "PWK",
    description:
      "Contoh dokumentasi penyusunan denah dan lapisan informasi wilayah. Data spasial akan diintegrasikan bertahap.",
    dateLabel: "Dokumentasi awal",
    image: "/images/placeholders/map.svg",
    featured: true,
  },
];

export const featuredActivities = activities.filter((activity) => activity.featured);
