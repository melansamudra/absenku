"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateBusinessState = { error: string | null };

export async function createBusiness(
  _prevState: CreateBusinessState,
  formData: FormData,
): Promise<CreateBusinessState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const name = (formData.get("name") as string)?.trim();
  const address = ((formData.get("address") as string) || "").trim() || null;
  const phone = ((formData.get("phone") as string) || "").trim() || null;

  if (!name) {
    return { error: "Nama bisnis wajib diisi." };
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .insert({ owner_id: user.id, name, address, phone })
    .select("id")
    .single();

  if (error || !business) {
    return { error: error?.message ?? "Gagal membuat bisnis." };
  }

  redirect(`/business/${business.id}`);
}
