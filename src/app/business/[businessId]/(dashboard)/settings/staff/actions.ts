"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type StaffActionState = { error: string | null };

const ROLES = ["admin", "hr", "staff"] as const;

export async function inviteStaff(
  businessId: string,
  _prevState: StaffActionState,
  formData: FormData,
): Promise<StaffActionState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const role = formData.get("role") as string;

  if (!name) return { error: "Nama wajib diisi." };
  if (!email) return { error: "Email wajib diisi." };
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { error: "Peran tidak valid." };

  const { data: userId, error: lookupError } = await supabase.rpc("find_user_id_by_email", { p_email: email });
  if (lookupError) return { error: lookupError.message };
  if (!userId) {
    return { error: `Belum ada akun HrCash dengan email ${email}. Minta orang itu daftar dulu lewat /signup, baru undang lagi.` };
  }

  const { error } = await supabase
    .from("business_staff")
    .insert({ business_id: businessId, user_id: userId, name, email, role, active: true });

  if (error) {
    if (error.code === "23505") return { error: "Orang ini sudah terdaftar sebagai staff bisnis ini." };
    return { error: error.message };
  }

  await logActivity(supabase, businessId, "Tambah staff", `${name} (${email}) — peran ${role}`);
  revalidatePath(`/business/${businessId}/settings/staff`);
  return { error: null };
}

export async function updateStaffRole(businessId: string, staffId: string, role: string) {
  if (!ROLES.includes(role as (typeof ROLES)[number])) return { error: "Peran tidak valid." };
  const supabase = await createClient();
  const { error } = await supabase.from("business_staff").update({ role }).eq("id", staffId);
  if (error) return { error: error.message };
  revalidatePath(`/business/${businessId}/settings/staff`);
  return { error: null };
}

export async function toggleStaffActive(businessId: string, staffId: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("business_staff").update({ active }).eq("id", staffId);
  if (error) return { error: error.message };
  revalidatePath(`/business/${businessId}/settings/staff`);
  return { error: null };
}
