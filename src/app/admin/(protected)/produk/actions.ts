"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { canDeleteContent, canEditContent } from "@/lib/auth/permissions";
import { requireStaff } from "@/lib/auth/require-staff";
import {
  createProduct,
  deleteProduct,
  getProductByIdForAdmin,
  updateProduct,
  type ProductAdminInput,
} from "@/lib/data/admin/products";
import { uploadContentCoverPhoto } from "@/lib/data/admin/media-upload";
import type { ProductAvailability } from "@/lib/supabase/database.types";
import {
  isAllowed,
  isValidSlug,
  normalizeImagePath,
  normalizeOptionalText,
  parseTextareaLines,
  productAvailabilities,
} from "@/lib/validation/content";

type ParsedProductInput =
  | {
      data: ProductAdminInput;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

function readText(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

function readOptionalText(formData: FormData, name: string) {
  return normalizeOptionalText(readText(formData, name));
}

function readLines(formData: FormData, name: string) {
  return parseTextareaLines(readText(formData, name));
}

function parsePrice(raw: string): { error: string | null; value: number | null } {
  if (!raw) {
    return { error: null, value: null };
  }

  const parsed = Number(raw);

  if (!Number.isFinite(parsed) || parsed < 0) {
    return { error: "Harga harus berupa angka positif.", value: null };
  }

  return { error: null, value: Math.round(parsed) };
}

function parseProductFormData(formData: FormData): ParsedProductInput {
  const slug = readText(formData, "slug").toLowerCase();
  const name = readText(formData, "name");
  const category = readText(formData, "category");
  const producerName = readText(formData, "producer_name");
  const description = readText(formData, "description");
  const availability = readText(formData, "availability");
  const imagePathResult = normalizeImagePath(readText(formData, "image_path"));
  const priceResult = parsePrice(readText(formData, "price"));

  if (!isValidSlug(slug)) {
    return { data: null, error: "Slug wajib huruf kecil, angka, atau tanda hubung." };
  }

  if (!name || !category || !producerName || !description) {
    return {
      data: null,
      error: "Nama, kategori, produsen, dan deskripsi wajib diisi.",
    };
  }

  if (name.length > 120 || slug.length > 100) {
    return { data: null, error: "Beberapa isian melebihi batas panjang." };
  }

  if (!isAllowed(availability, productAvailabilities)) {
    return { data: null, error: "Status ketersediaan tidak valid." };
  }

  if (imagePathResult.error) {
    return { data: null, error: imagePathResult.error };
  }

  if (priceResult.error) {
    return { data: null, error: priceResult.error };
  }

  return {
    data: {
      availability: availability as ProductAvailability,
      benefits: readLines(formData, "benefits"),
      category,
      description,
      featured: formData.get("featured") === "on",
      image_path: imagePathResult.value,
      name,
      price: priceResult.value,
      producer_name: producerName,
      slug,
      unit: readOptionalText(formData, "unit"),
      whatsapp_number: readOptionalText(formData, "whatsapp_number"),
    },
    error: null,
  };
}

function errorCode(message: string) {
  if (message.includes("Slug")) {
    return "duplikat";
  }

  if (message.includes("admin")) {
    return "otorisasi";
  }

  return "validasi";
}

function revalidateProductPages(oldSlug?: string, newSlug?: string) {
  revalidatePath("/");
  revalidatePath("/produk");
  revalidatePath("/admin");
  revalidatePath("/admin/produk");
  revalidatePath("/sitemap.xml");

  if (oldSlug) {
    revalidatePath(`/produk/${oldSlug}`);
  }

  if (newSlug && newSlug !== oldSlug) {
    revalidatePath(`/produk/${newSlug}`);
  }
}

export async function createProductAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/produk/baru");

  if (!canEditContent(profile.role)) {
    redirect("/admin/produk?error=otorisasi");
  }

  const parsed = parseProductFormData(formData);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/produk/baru?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const result = await createProduct(parsed.data, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/produk/baru?error=${errorCode(result.error ?? "gagal")}`);
  }

  const created = result.data;
  revalidateProductPages(undefined, created.slug);
  redirect(`/admin/produk/${created.id}/edit?success=dibuat`);
}

export async function updateProductAction(id: string, formData: FormData) {
  const { profile, user } = await requireStaff(`/admin/produk/${id}/edit`);

  if (!canEditContent(profile.role)) {
    redirect(`/admin/produk/${id}/edit?error=otorisasi`);
  }

  const existing = await getProductByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/produk?error=tidak-ditemukan");
  }

  const currentProduct = existing.data;
  const parsed = parseProductFormData(formData);

  if (parsed.error || !parsed.data) {
    redirect(`/admin/produk/${id}/edit?error=${errorCode(parsed.error ?? "validasi")}`);
  }

  const result = await updateProduct(id, parsed.data, user.id);

  if (result.error || !result.data) {
    redirect(`/admin/produk/${id}/edit?error=${errorCode(result.error ?? "gagal")}`);
  }

  revalidateProductPages(currentProduct.slug, result.data.slug);
  redirect(`/admin/produk/${id}/edit?success=diperbarui`);
}

function photoErrorCode(message: string) {
  if (message.includes("Format file")) {
    return "foto-format";
  }

  if (message.includes("Ukuran") || message.includes("kompresi")) {
    return "foto-ukuran";
  }

  return "foto-gagal";
}

export async function uploadProductPhotoAction(formData: FormData) {
  const { profile, user } = await requireStaff("/admin/produk");
  const id = readText(formData, "id");
  const actorName = profile.display_name?.trim() || user.email || null;

  if (!id || !canEditContent(profile.role)) {
    redirect("/admin/produk?error=otorisasi");
  }

  const existing = await getProductByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/produk?error=tidak-ditemukan");
  }

  const file = formData.get("photo");

  if (!(file instanceof File) || file.size === 0) {
    redirect(`/admin/produk/${id}/edit?error=foto-kosong`);
  }

  const result = await uploadContentCoverPhoto({
    actorId: user.id,
    actorName,
    entityId: id,
    entityLabel: existing.data.name,
    entitySlug: existing.data.slug,
    file,
    target: "product",
  });

  if (result.error) {
    console.error("Gagal mengunggah foto produk", { productId: id });
    redirect(`/admin/produk/${id}/edit?error=${photoErrorCode(result.error)}`);
  }

  revalidateProductPages(existing.data.slug, existing.data.slug);
  redirect(`/admin/produk/${id}/edit?success=foto-diperbarui`);
}

export async function deleteProductAction(formData: FormData) {
  const { profile } = await requireStaff("/admin/produk");
  const id = readText(formData, "id");
  const confirmed = formData.get("confirm_delete") === "permanen";

  if (!id || !canDeleteContent(profile.role) || !confirmed) {
    redirect("/admin/produk?error=hapus");
  }

  const existing = await getProductByIdForAdmin(id);

  if (existing.error || !existing.data) {
    redirect("/admin/produk?error=tidak-ditemukan");
  }

  const result = await deleteProduct(id, profile.role);

  if (result.error) {
    redirect(`/admin/produk?error=${errorCode(result.error)}`);
  }

  revalidateProductPages(existing.data.slug);
  redirect("/admin/produk?success=dihapus");
}
