export type NavigationItem = {
  label: string;
  href: string;
};

export const mainNavigation: NavigationItem[] = [
  { label: "Beranda", href: "/" },
  { label: "Tentang", href: "/tentang" },
  { label: "Tanaman", href: "/tanaman" },
  { label: "Ramuan", href: "/ramuan" },
  { label: "Peta", href: "/peta" },
  { label: "Zona Kesehatan", href: "/zona-kesehatan" },
  { label: "Produk", href: "/produk" },
  { label: "Kegiatan", href: "/kegiatan" },
  { label: "Kinerja RT", href: "/kinerja-rt" },
  { label: "Kotak Saran", href: "/kotak-saran" },
];

export const footerNavigation: NavigationItem[] = [
  { label: "Zona Kesehatan", href: "/zona-kesehatan" },
  { label: "Kunjungan Edukasi", href: "/wisata" },
  { label: "Tim KKN", href: "/tim" },
  { label: "Kotak Saran", href: "/kotak-saran" },
];
