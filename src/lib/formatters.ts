import type {
  PlantCategory,
  ProductAvailability,
  ProgramStatus,
  ValidationStatus,
} from "@/types";

export function getValidationStatusLabel(status: ValidationStatus) {
  const labels: Record<ValidationStatus, string> = {
    "data-demonstrasi": "Data awal",
    "menunggu-verifikasi": "Menunggu verifikasi",
    terverifikasi: "Terverifikasi",
    ditolak: "Ditolak",
  };

  return labels[status];
}

export function getAvailabilityLabel(status: ProductAvailability) {
  const labels: Record<ProductAvailability, string> = {
    tersedia: "Tersedia",
    terbatas: "Terbatas",
    habis: "Habis",
    "segera-tersedia": "Segera tersedia",
  };

  return labels[status];
}

export function getProgramStatusLabel(status: ProgramStatus) {
  const labels: Record<ProgramStatus, string> = {
    planned: "Direncanakan",
    ongoing: "Berjalan",
    completed: "Selesai",
  };

  return labels[status];
}

export function getCategoryLabel(category: PlantCategory) {
  return category;
}

export function formatPrice(price: number | null, unit: string | null) {
  if (price === null) {
    return "Belum dikonfirmasi";
  }

  const formatted = new Intl.NumberFormat("id-ID", {
    currency: "IDR",
    maximumFractionDigits: 0,
    style: "currency",
  }).format(price);

  return unit ? `${formatted} ${unit}` : formatted;
}
