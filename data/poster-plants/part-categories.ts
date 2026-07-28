import type { PosterPlantPartCategory } from "@/types";

const byKeyword: Array<[RegExp, PosterPlantPartCategory]> = [
  [/\bdaun\b/i, "Daun"],
  [/\bbunga\b/i, "Bunga"],
  [/\bkulit\b|\bbark\b/i, "Kulit"],
  [/\bbiji\b|\bseed\b/i, "Biji"],
  [/\bbuah\b|\banggur\b|\bjeruk\b|\bbelimbing\b|\btomat\b/i, "Buah"],
  [/\bakar\b/i, "Akar"],
  [/\brimpang\b|\bjahe\b|\bkunyit\b|\btemu\b|\bkencur\b|\blengkuas\b/i, "Rimpang"],
  [/\bbawang\b|\bumbi\b/i, "Umbi"],
];

const explicitCategories: Record<string, PosterPlantPartCategory> = {
  ashwagandha: "Akar",
  brokoli: "Bunga",
  habbatussauda: "Biji",
  "jintan hitam": "Biji",
  "kayu manis": "Kulit",
  miswak: "Batang",
  "willow bark": "Kulit",
};

export function getPosterPlantPartCategory(
  normalizedName: string,
): PosterPlantPartCategory {
  const explicit = explicitCategories[normalizedName];

  if (explicit) {
    return explicit;
  }

  for (const [pattern, category] of byKeyword) {
    if (pattern.test(normalizedName)) {
      return category;
    }
  }

  return "Tidak diklasifikasikan";
}
