"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

export async function updateBusinessSettings(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const izinDeductionMode = formData.get("izin_deduction_mode") as string;

  if (!name) return { error: "Nama bisnis wajib diisi." };
  if (izinDeductionMode !== "flat" && izinDeductionMode !== "full_day") {
    return { error: "Mode potongan izin tidak valid." };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      address: ((formData.get("address") as string) || "").trim() || null,
      phone: ((formData.get("phone") as string) || "").trim() || null,
      work_start_time: formData.get("work_start_time") as string,
      work_end_time: formData.get("work_end_time") as string,
      izin_deduction_mode: izinDeductionMode,
      izin_deduction_weekday: Number(formData.get("izin_deduction_weekday") ?? 0),
      izin_deduction_weekend: Number(formData.get("izin_deduction_weekend") ?? 0),
      late_deduction_per_occurrence: Number(formData.get("late_deduction_per_occurrence") ?? 0),
      lembur_rate_per_hour: Number(formData.get("lembur_rate_per_hour") ?? 0),
      pph21_enabled: formData.get("pph21_enabled") === "on",
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  await logActivity(supabase, businessId, "Pengaturan bisnis diubah");

  revalidatePath(`/business/${businessId}/settings`);
  return { error: null };
}
