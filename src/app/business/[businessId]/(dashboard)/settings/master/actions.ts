"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type MasterKind = "organizations" | "positions" | "ranks";
export type MasterState = { error: string | null };

const LABEL: Record<MasterKind, string> = {
  organizations: "Organisasi",
  positions: "Jabatan",
  ranks: "Pangkat",
};

function isKind(k: string): k is MasterKind {
  return k in LABEL;
}

function friendly(error: { message: string }, label: string, name: string) {
  return error.message.includes("duplicate") ? `${label} "${name}" sudah ada.` : error.message;
}

export async function addMasterItem(businessId: string, kind: string, name: string): Promise<MasterState> {
  if (!isKind(kind)) return { error: "Jenis data tidak valid." };
  const clean = name.trim();
  if (!clean) return { error: `Nama ${LABEL[kind].toLowerCase()} wajib diisi.` };
  const supabase = await createClient();
  const { error } = await supabase.from(kind).insert({ business_id: businessId, name: clean });
  if (error) return { error: friendly(error, LABEL[kind], clean) };
  revalidatePath(`/business/${businessId}/settings/master`);
  return { error: null };
}

export async function renameMasterItem(
  businessId: string,
  kind: string,
  id: string,
  name: string,
): Promise<MasterState> {
  if (!isKind(kind)) return { error: "Jenis data tidak valid." };
  const clean = name.trim();
  if (!clean) return { error: "Nama wajib diisi." };
  const supabase = await createClient();
  const { error } = await supabase.from(kind).update({ name: clean }).eq("id", id).eq("business_id", businessId);
  if (error) return { error: friendly(error, LABEL[kind], clean) };

  // `employees.note` dipakai Portal Karyawan sebagai label jabatan — ikut disegarkan.
  if (kind === "positions") {
    await supabase.from("employees").update({ note: clean }).eq("position_id", id).eq("business_id", businessId);
  }
  revalidatePath(`/business/${businessId}/settings/master`);
  revalidatePath(`/business/${businessId}/employees`);
  return { error: null };
}

export async function deleteMasterItem(businessId: string, kind: string, id: string): Promise<MasterState> {
  if (!isKind(kind)) return { error: "Jenis data tidak valid." };
  const supabase = await createClient();
  const { data: row } = await supabase.from(kind).select("name").eq("id", id).eq("business_id", businessId).maybeSingle();
  // Karyawan yang memakai item ini tidak ikut terhapus — kolomnya dikosongkan (on delete set null).
  const { error } = await supabase.from(kind).delete().eq("id", id).eq("business_id", businessId);
  if (error) return { error: error.message };
  await logActivity(supabase, businessId, `${LABEL[kind]} dihapus`, row?.name);
  revalidatePath(`/business/${businessId}/settings/master`);
  revalidatePath(`/business/${businessId}/employees`);
  return { error: null };
}
