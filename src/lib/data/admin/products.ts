import type {
  Database,
  ProductAvailability,
} from "@/lib/supabase/database.types";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { StaffRole } from "@/lib/auth/permissions";

export type ProductAdminRecord = Database["public"]["Tables"]["products"]["Row"];

export type ProductAdminInput = {
  availability: ProductAvailability;
  benefits: string[];
  category: string;
  description: string;
  featured: boolean;
  image_path: string | null;
  name: string;
  price: number | null;
  producer_name: string;
  slug: string;
  unit: string | null;
  whatsapp_number: string | null;
};

export type ProductAdminFilters = {
  availability?: ProductAvailability | "all";
  query?: string;
};

export type AdminMutationResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: string;
    };

async function getAdminClient() {
  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      client: null,
      error: "Supabase belum dikonfigurasi untuk dashboard admin.",
    };
  }

  return { client, error: null };
}

export async function getAllProductsForAdmin(
  filters: ProductAdminFilters = {},
): Promise<AdminMutationResult<ProductAdminRecord[]>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  let query = client.from("products").select("*").order("updated_at", {
    ascending: false,
  });

  if (filters.query) {
    const escapedQuery = filters.query.replaceAll("%", "\\%").replaceAll("_", "\\_");
    query = query.or(
      `name.ilike.%${escapedQuery}%,slug.ilike.%${escapedQuery}%,category.ilike.%${escapedQuery}%`,
    );
  }

  if (filters.availability && filters.availability !== "all") {
    query = query.eq("availability", filters.availability);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Gagal memuat daftar produk admin", { code: error.code });
    return { data: null, error: "Daftar produk belum dapat dimuat." };
  }

  return { data: data ?? [], error: null };
}

export async function getProductByIdForAdmin(
  id: string,
): Promise<AdminMutationResult<ProductAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const { data, error } = await client
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("Gagal memuat detail produk admin", { code: error.code });
    return { data: null, error: "Data produk belum dapat dimuat." };
  }

  if (!data) {
    return { data: null, error: "Produk tidak ditemukan." };
  }

  return { data, error: null };
}

export async function createProduct(
  input: ProductAdminInput,
  actorId: string,
): Promise<AdminMutationResult<ProductAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const payload: Database["public"]["Tables"]["products"]["Insert"] = {
    ...input,
    created_by: actorId,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("products")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal membuat produk admin", { code: error.code });
    return {
      data: null,
      error: error.code === "23505" ? "Slug produk sudah dipakai." : "Produk belum dapat dibuat.",
    };
  }

  return { data, error: null };
}

export async function updateProduct(
  id: string,
  input: ProductAdminInput,
  actorId: string,
): Promise<AdminMutationResult<ProductAdminRecord>> {
  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  const payload: Database["public"]["Tables"]["products"]["Update"] = {
    ...input,
    updated_by: actorId,
  };

  const { data, error } = await client
    .from("products")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    console.error("Gagal memperbarui produk admin", { code: error.code });
    return {
      data: null,
      error:
        error.code === "23505" ? "Slug produk sudah dipakai." : "Produk belum dapat diperbarui.",
    };
  }

  return { data, error: null };
}

export async function deleteProduct(
  id: string,
  role: StaffRole,
): Promise<AdminMutationResult<{ id: string }>> {
  if (role !== "admin") {
    return { data: null, error: "Hanya admin yang dapat menghapus produk." };
  }

  const { client, error: clientError } = await getAdminClient();

  if (!client) {
    return { data: null, error: clientError };
  }

  // content_media_slots.content_key is a plain polymorphic column with no
  // foreign key (it can't reference a specific table), so deleting a
  // product does not cascade -- clean up its media link(s) explicitly.
  await client
    .from("content_media_slots")
    .delete()
    .eq("content_type", "product")
    .eq("content_key", id);

  const { error } = await client.from("products").delete().eq("id", id);

  if (error) {
    console.error("Gagal menghapus produk admin", { code: error.code });
    return { data: null, error: "Produk belum dapat dihapus." };
  }

  return { data: { id }, error: null };
}
