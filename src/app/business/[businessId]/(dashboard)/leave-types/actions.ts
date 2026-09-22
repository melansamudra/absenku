"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createLeaveType(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = ((formData.get("name") as string) || "").trim();
  const defaultDaysPerYear = Number(formData.get("default_days_per_year") ?? 0);
  const paid = formData.get("paid") === "on";

  if (!name) return { error: "Nama jenis cuti wajib diisi." };
  if (!(defaultDaysPerYear >= 0)) return { error: "Kuota hari tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase.from("leave_types").insert({
    business_id: businessId,
    name,
    default_days_per_year: defaultDaysPerYear,
    paid,
  });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/leave-types`);
  return { error: null };
}

export async function toggleLeaveTypeActive(businessId: string, leaveTypeId: string, active: boolean) {
  const supabase = await createClient();
  await supabase
    .from("leave_types")
    .update({ active })
    .eq("id", leaveTypeId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/leave-types`);
}
