export type MapLegendCategory = {
  id: "streets" | "zones" | "facilities" | "entrances" | "information";
  label: string;
  description: string;
  swatchClassName: string;
};

export const communityMapConfig = {
  googleMapsUrl: "https://maps.app.goo.gl/LZi2bArDspCxwpgn6",
  locationName: "Kampung Herbal Harmony Berua",
  regionLines: [
    "RT 009/RW 006",
    "Kelurahan Berua",
    "Kecamatan Biringkanaya",
  ],
  mapTitle: "Peta Kompleks Kampung Herbal",
  mapStatus: "Dalam penyusunan",
  mapPreparedBy: "Tim Perencanaan Wilayah dan Kota",
  privacyNote:
    "Peta publik tidak menampilkan koordinat rumah, titik warga, data kesehatan perorangan, atau informasi pribadi.",
  attributionNote:
    "Aset peta final akan mencantumkan penyusun, tanggal versi, dan sumber dokumentasi wilayah yang digunakan.",
} as const;

export const communityMapLegend: MapLegendCategory[] = [
  {
    description: "Koridor jalan tematik yang menghubungkan papan dan tanaman.",
    id: "streets",
    label: "Jalan tematik",
    swatchClassName: "bg-herbal-brown",
  },
  {
    description: "Tema kesehatan HerbaCode sebagai lapisan edukasi non-klinis.",
    id: "zones",
    label: "Zona kesehatan",
    swatchClassName: "bg-herbal-green",
  },
  {
    description: "Ruang umum atau fasilitas kampung yang boleh ditampilkan publik.",
    id: "facilities",
    label: "Fasilitas",
    swatchClassName: "bg-herbal-sage",
  },
  {
    description: "Akses masuk kawasan bila sudah diverifikasi oleh tim peta.",
    id: "entrances",
    label: "Pintu masuk",
    swatchClassName: "bg-herbal-gold",
  },
  {
    description: "Titik informasi publik, papan edukasi, atau penanda program.",
    id: "information",
    label: "Titik informasi",
    swatchClassName: "bg-white ring-2 ring-herbal-green",
  },
];
