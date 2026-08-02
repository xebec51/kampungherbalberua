"use server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export type SubmitSuggestionInput = {
  category: string;
  title: string;
  content: string;
  location: string;
  name: string;
  contact: string;
  anonymous: boolean;
};

export type SubmitSuggestionResult =
  | { status: "success" }
  | { status: "error"; message: string };

const genericErrorMessage =
  "Saran gagal dikirim. Periksa koneksi internet Anda dan coba lagi.";

export async function submitSuggestionAction(
  input: SubmitSuggestionInput,
): Promise<SubmitSuggestionResult> {
  const category = input.category.trim();
  const title = input.title.trim();
  const content = input.content.trim();

  if (!category || !title || !content) {
    return {
      status: "error",
      message: "Kategori, judul, dan isi saran wajib diisi.",
    };
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return {
      status: "error",
      message: "Layanan penyimpanan saran belum tersedia. Coba lagi nanti.",
    };
  }

  const location = input.location.trim();
  const name = input.anonymous ? "" : input.name.trim();
  const contact = input.anonymous ? "" : input.contact.trim();

  const { error } = await client.from("suggestions").insert({
    category,
    title,
    content,
    location: location || null,
    submitter_name: name || null,
    submitter_contact: contact || null,
    is_anonymous: input.anonymous,
  });

  if (error) {
    console.error("Gagal menyimpan saran warga", { code: error.code });
    return { status: "error", message: genericErrorMessage };
  }

  return { status: "success" };
}
