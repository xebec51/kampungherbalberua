export type AgeDistributionMapAsset = {
  src: string;
  width: number;
  height: number;
  label: string;
};

export type AgeDistributionMapConfig = {
  title: string;
  location: string;
  sourceLabel: string;
  displayImage: AgeDistributionMapAsset;
  downloadImage: AgeDistributionMapAsset;
  altText: string;
  sourceNote: string;
  privacyNote: string;
};

export const ageDistributionMapConfig = {
  title: "Peta Persebaran Kelompok Usia",
  location:
    "RT 009/RW 006 - Kelurahan Berua - Kecamatan Biringkanaya - Kota Makassar",
  sourceLabel: "KKN Prestasi Gel. 116 - Universitas Hasanuddin",
  displayImage: {
    height: 2514,
    label: "Gambar WebP untuk tampilan halaman",
    src: "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.webp",
    width: 3600,
  },
  downloadImage: {
    height: 4190,
    label: "PNG resolusi tinggi untuk unduhan",
    src: "/images/peta/peta-persebaran-kelompok-usia-rt009-rw006.png",
    width: 6000,
  },
  altText:
    "Peta Persebaran Kelompok Usia RT 009/RW 006 Berua dengan titik kategori usia dan legenda sesuai gambar sumber.",
  sourceNote:
    "Isi peta mengikuti gambar sumber yang diberikan tanpa perubahan data.",
  privacyNote:
    "Peta ditampilkan sebagai gambar dokumentasi. Website tidak menyalin titik peta menjadi koordinat, nama warga, nomor telepon, atau data perorangan.",
} as const satisfies AgeDistributionMapConfig;
