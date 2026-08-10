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
  mapStatus: "Denah Kompleks",
  mapPreparedBy: "Tim Perencanaan Wilayah dan Kota",
  mapImageSrc: "/images/peta/peta-visual-kampung-harmony.webp",
  mapImageDownloadSrc: "/images/peta/peta-visual-kampung-harmony.png",
  mapImageWidth: 5670,
  mapImageHeight: 3995,
  privacyNote:
    "Peta publik tidak menampilkan koordinat rumah, titik warga, data kesehatan perorangan, atau informasi pribadi.",
  attributionNote:
    "Peta ini disusun oleh Tim Perencanaan Wilayah dan Kota berdasarkan dokumentasi wilayah Kampung Herbal Berua.",
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
    description: "Titik akses masuk resmi ke kawasan kampung.",
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
