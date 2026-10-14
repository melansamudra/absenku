"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function addCollectiveLeaveDay(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const date = formData.get("date") as string;
  const label = ((formData.get("label") as string) || "").trim();
  const leaveTypeId = (formData.get("leave_type_id") as string) || null;

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal wajib diisi." };
  if (!label) return { error: "Nama/keterangan wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase.from("collective_leave_days").insert({
    business_id: businessId,
    date,
    label,
    leave_type_id: leaveTypeId,
  });

  if (error) {
    return {
      error: error.code === "23505" ? "Sudah ada cuti bersama untuk tanggal itu." : error.message,
    };
  }

  revalidatePath(`/business/${businessId}/leave-requests/cuti-bersama`);
  revalidatePath(`/business/${businessId}/leave-requests/balance`);
  return { error: null };
}

export async function deleteCollectiveLeaveDay(businessId: string, id: string) {
  const supabase = await createClient();
  await supabase.from("collective_leave_days").delete().eq("id", id).eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/leave-requests/cuti-bersama`);
  revalidatePath(`/business/${businessId}/leave-requests/balance`);
}
