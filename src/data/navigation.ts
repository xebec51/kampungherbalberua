export type DirectNavigationItem = {
  type: "link";
  label: string;
  href: string;
};

export type NavigationGroup = {
  type: "group";
  label: string;
  children: DirectNavigationItem[];
};

export type NavigationCTA = {
  type: "cta";
  label: string;
  href: string;
};

export type NavigationItem =
  | DirectNavigationItem
  | NavigationGroup
  | NavigationCTA;

export const mainNavigation: NavigationItem[] = [
  { type: "link", label: "Beranda", href: "/" },
  {
    type: "group",
    label: "Edukasi",
    children: [
      { type: "link", label: "Tanaman TOGA", href: "/tanaman" },
      { type: "link", label: "Zona Kesehatan", href: "/zona-kesehatan" },
    ],
  },
  { type: "link", label: "Peta Kampung", href: "/peta" },
  {
    type: "group",
    label: "Informasi Kampung",
    children: [
      { type: "link", label: "Tentang", href: "/tentang" },
      { type: "link", label: "Jalan Tematik", href: "/jalan" },
      { type: "link", label: "Produk Warga", href: "/produk" },
      { type: "link", label: "Kinerja RT", href: "/kinerja-rt" },
      { type: "link", label: "Kotak Saran", href: "/kotak-saran" },
    ],
  },
];

export const footerMainNavigation: DirectNavigationItem[] = [
  { type: "link", label: "Tentang", href: "/tentang" },
  { type: "link", label: "Tanaman TOGA", href: "/tanaman" },
  { type: "link", label: "Zona Kesehatan", href: "/zona-kesehatan" },
  { type: "link", label: "Peta Kampung", href: "/peta" },
];

export const footerNavigation: DirectNavigationItem[] = [
  { type: "link", label: "Jalan Tematik", href: "/jalan" },
  { type: "link", label: "Produk Warga", href: "/produk" },
  { type: "link", label: "Tim KKN", href: "/tim" },
  { type: "link", label: "Kotak Saran", href: "/kotak-saran" },
];
