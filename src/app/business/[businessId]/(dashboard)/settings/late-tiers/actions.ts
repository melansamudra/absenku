"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createLateTier(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const thresholdMinutes = Number(formData.get("threshold_minutes") ?? -1);
  const amount = Number(formData.get("amount") ?? -1);

  if (!(thresholdMinutes >= 0)) return { error: "Ambang menit tidak valid." };
  if (!(amount >= 0)) return { error: "Nominal tidak valid." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("late_deduction_tiers")
    .insert({ business_id: businessId, threshold_minutes: thresholdMinutes, amount });

  if (error) {
    // Unique (business_id, threshold_minutes) — pesan lebih ramah daripada
    // error constraint mentah dari Postgres.
    if (error.code === "23505") {
      return { error: "Sudah ada tier dengan ambang menit yang sama." };
    }
    return { error: error.message };
  }

  revalidatePath(`/business/${businessId}/settings/late-tiers`);
  return { error: null };
}

export async function deleteLateTier(businessId: string, tierId: string) {
  const supabase = await createClient();
  await supabase
    .from("late_deduction_tiers")
    .delete()
    .eq("id", tierId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/settings/late-tiers`);
}
