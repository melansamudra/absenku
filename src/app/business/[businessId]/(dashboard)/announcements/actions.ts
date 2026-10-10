"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { isAnnouncementCategory } from "@/lib/announcements/categories";

export type AnnouncementState = { error: string | null };

export async function createAnnouncement(businessId: string, _prev: AnnouncementState, formData: FormData): Promise<AnnouncementState> {
  const title = ((formData.get("title") as string) ?? "").trim().slice(0, 120);
  const body = ((formData.get("body") as string) ?? "").trim().slice(0, 2000) || null;
  const category = (formData.get("category") as string) ?? "info";
  const pinned = formData.get("pinned") === "on";
  const expiresAt = ((formData.get("expires_at") as string) ?? "") || null;

  if (!title) return { error: "Judul wajib diisi." };
  if (!isAnnouncementCategory(category)) return { error: "Kategori tidak valid." };
  if (expiresAt && !/^\d{4}-\d{2}-\d{2}$/.test(expiresAt)) return { error: "Tanggal berakhir tidak valid." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase
    .from("announcements")
    .insert({ business_id: businessId, title, body, category, pinned, expires_at: expiresAt, created_by: user?.email ?? null });
  if (error) return { error: error.message.includes("does not exist") || error.message.includes("schema cache") ? "Jalankan dulu SQL Papan Informasi di Supabase." : error.message };

  await logActivity(supabase, businessId, "Pengumuman dibuat", title);
  revalidatePath(`/business/${businessId}/announcements`);
  return { error: null };
}

export async function setAnnouncementPinned(businessId: string, id: string, pinned: boolean) {
  const supabase = await createClient();
  await supabase.from("announcements").update({ pinned }).eq("id", id).eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/announcements`);
}

export async function deleteAnnouncement(businessId: string, id: string) {
  const supabase = await createClient();
  await supabase.from("announcements").delete().eq("id", id).eq("business_id", businessId);
  await logActivity(supabase, businessId, "Pengumuman dihapus");
  revalidatePath(`/business/${businessId}/announcements`);
}
