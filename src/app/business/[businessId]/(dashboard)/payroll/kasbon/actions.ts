"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function addKasbon(
  businessId: string,
  employeeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const amount = Number(formData.get("amount") ?? 0);
  const date = formData.get("date") as string;
  const note = ((formData.get("note") as string) || "").trim() || null;

  if (!(amount > 0)) return { error: "Nominal harus lebih dari 0." };
  if (!date) return { error: "Tanggal wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("employee_advances")
    .insert({ business_id: businessId, employee_id: employeeId, date, amount, note });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/kasbon`);
  return { error: null };
}
