"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createRecurringAllowance(
  businessId: string,
  employeeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const label = ((formData.get("label") as string) || "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (!label) return { error: "Keterangan wajib diisi." };
  if (!(amount > 0)) return { error: "Nominal harus lebih dari 0." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("employee_recurring_allowances")
    .insert({ business_id: businessId, employee_id: employeeId, label, amount });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/employees/tunjangan-tetap`);
  return { error: null };
}

export async function toggleRecurringAllowanceActive(
  businessId: string,
  allowanceId: string,
  active: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("employee_recurring_allowances")
    .update({ active })
    .eq("id", allowanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/employees/tunjangan-tetap`);
}

export async function deleteRecurringAllowance(businessId: string, allowanceId: string) {
  const supabase = await createClient();
  await supabase
    .from("employee_recurring_allowances")
    .delete()
    .eq("id", allowanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/employees/tunjangan-tetap`);
}
