export type PlantCategory = "Rimpang" | "Daun" | "Bunga" | "Batang" | "Lainnya";

export type ValidationStatus =
  | "data-demonstrasi"
  | "menunggu-verifikasi"
  | "terverifikasi"
  | "ditolak";

export type Plant = {
  id: string;
  slug: string;
  localName: string;
  scientificName: string;
  otherNames: string[];
  category: PlantCategory;
  shortDescription: string;
  description: string;
  usedParts: string[];
  traditionalUses: string[];
  preparation: string[];
  careInstructions: string[];
  warnings: string[];
  image: string;
  locationStatus: string;
  source: string;
  validator: string;
  validationStatus: ValidationStatus;
  featured: boolean;
  published: boolean;
};

export type RecipeIngredient = {
  name: string;
  amount: string;
};

export type Recipe = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  traditionalPurpose: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  servingSuggestion: string;
  warnings: string[];
  image: string;
  author: string;
  validator: string;
  validationStatus: ValidationStatus;
  published: boolean;
};

export type ProductAvailability =
  | "tersedia"
  | "terbatas"
  | "habis"
  | "segera-tersedia";

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
  price: number | null;
  unit: string | null;
  image: string;
  producerName: string;
  whatsappNumber: string | null;
  availability: ProductAvailability;
  featured: boolean;
};

export type ProgramStatus = "planned" | "ongoing" | "completed";

export type Program = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  status: ProgramStatus;
  progress: number | null;
  startDate: string | null;
  endDate: string | null;
  image: string;
  featured: boolean;
};

export type Activity = {
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  dateLabel: string;
  image: string;
  featured: boolean;
};

export type TeamMember = {
  id: string;
  name: string;
  studyProgram: string;
  contribution: string;
};
