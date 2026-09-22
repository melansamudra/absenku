"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createHoliday(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const holidayDate = formData.get("holiday_date") as string;
  const label = ((formData.get("label") as string) || "").trim() || null;

  if (!holidayDate) return { error: "Tanggal wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("payroll_holidays")
    .insert({ business_id: businessId, holiday_date: holidayDate, label });

  if (error) {
    if (error.code === "23505") return { error: "Tanggal ini sudah ditambahkan." };
    return { error: error.message };
  }

  revalidatePath(`/business/${businessId}/settings/holidays`);
  return { error: null };
}

export async function deleteHoliday(businessId: string, holidayId: string) {
  const supabase = await createClient();
  await supabase
    .from("payroll_holidays")
    .delete()
    .eq("id", holidayId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/settings/holidays`);
}
