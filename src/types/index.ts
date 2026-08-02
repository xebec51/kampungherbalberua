export type PlantCategory = "Rimpang" | "Daun" | "Bunga" | "Batang" | "Lainnya";

export type ValidationStatus =
  | "data-demonstrasi"
  | "menunggu-verifikasi"
  | "terverifikasi"
  | "ditolak";

export type ContentStatus = "draft" | "pending-review" | "published" | "archived";

export type PosterPlantPartCategory =
  | "Daun"
  | "Rimpang"
  | "Bunga"
  | "Buah"
  | "Biji"
  | "Batang"
  | "Akar"
  | "Kulit"
  | "Umbi"
  | "Herbal utuh"
  | "Bahan olahan"
  | "Tidak diklasifikasikan";

export type MediaRelevanceStatus =
  | "exact"
  | "common_name_match"
  | "corrected_spelling_match"
  | "material_match"
  | "illustration_reference"
  | "generic_fallback";

export type PublicImageKind = "specific" | "reference" | "generic";

export type PublicMediaAsset = {
  id: string;
  title: string;
  altText: string;
  caption: string | null;
  imageType: string | null;
  publicUrl: string;
  width: number | null;
  height: number | null;
  creatorName: string | null;
  licenseCode: string | null;
  licenseUrl: string | null;
  attributionText: string | null;
  changesMade: string | null;
  sourcePageUrl: string | null;
  relevanceStatus?: MediaRelevanceStatus | null;
  duplicateStatus?: string | null;
  usageCount?: number | null;
};

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

export type HerbaCodeZoneSummary = {
  id: string;
  zoneCode: string;
  slug: string;
  title: string;
  shortDescription: string;
  plantCount: number;
  streetNames: string[];
  displayOrder: number | null;
};

export type HerbaCodeZoneDetail = HerbaCodeZoneSummary & {
  entries: HerbaCodePlantZoneEntry[];
};

export type HerbaCodePlantZoneEntry = {
  id: string;
  plantId: string;
  plantSlug: string;
  plantLocalName: string;
  plantScientificName: string | null;
  zoneId: string;
  zoneCode: string;
  zoneSlug: string;
  zoneTitle: string;
  zoneShortDescription: string | null;
  zoneDisplayOrder: number | null;
  entryOrder: number;
  localName: string;
  scientificName: string | null;
  activeCompounds: string[];
  benefits: string[];
  usedParts: string[];
  cultivationTechniques: string[];
  warnings: string[];
  preparationMethods: string[];
  sourceDocumentName: string;
};

export type HerbaCodePlantProfile = {
  id: string;
  slug: string;
  localName: string;
  scientificName: string | null;
  aliases: string[];
  image: string | null;
  imageMedia: PublicMediaAsset | null;
  shortDescription: string | null;
  sourceDocumentName: string;
  zoneEntries: HerbaCodePlantZoneEntry[];
};

export type PosterPlantCatalogItem = {
  id: string;
  rawName: string;
  normalizedName: string;
  slug: string;
  posterOccurrenceCount: number;
  posterNumbers: number[];
  collections: string[];
  linkedPlantId: string | null;
  linkedPlantSlug: string | null;
  localName: string;
  scientificName: string | null;
  category: PlantCategory | null;
  partCategory: PosterPlantPartCategory;
  image: string | null;
  imageIsIllustration: boolean;
  imageKind: PublicImageKind;
  imageRelevanceStatus: MediaRelevanceStatus;
  imageDuplicateStatus: string | null;
  sourceLabel: string;
  description: string;
  attributionText: string | null;
  creatorName: string | null;
  changesMade: string | null;
  sourcePageUrl: string | null;
  licenseCode: string | null;
  licenseUrl: string | null;
  searchAliases: string[];
};

export type HealthZone = {
  id: string;
  zoneCode: string;
  slug: string;
  programName: string;
  streetName: string | null;
  zoneName: string;
  blockRanges: string[];
  healthTopic: string;
  signText: string | null;
  shortDescription: string;
  overview: string;
  educationalPoints: string[];
  healthyHabits: string[];
  importantNotes: string[];
  sourceNotes: string[];
  imagePath: string | null;
  locationNotes: string | null;
  validatorName: string;
  validationStatus: ValidationStatus;
  contentStatus: ContentStatus;
  featured: boolean;
  publishedAt: string | null;
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
  faculty: string;
  entryYear: number;
  contribution: string;
  photoPath?: string;
};
