"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth/require-staff";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function markSuggestionDoneAction(formData: FormData) {
  await requireStaff("/admin/kotak-saran");

  const id = formData.get("id");

  if (typeof id !== "string" || !id) {
    return;
  }

  const client = await createSupabaseServerClient();

  if (!client) {
    return;
  }

  await client.from("suggestions").update({ status: "selesai" }).eq("id", id);

  revalidatePath("/admin/kotak-saran");
}
