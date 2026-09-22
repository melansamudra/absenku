"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createShiftTemplate(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = ((formData.get("name") as string) || "").trim();
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  if (!name) return { error: "Nama shift wajib diisi." };
  if (!startTime || !endTime) return { error: "Jam mulai & selesai wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shift_templates")
    .insert({ business_id: businessId, name, start_time: startTime, end_time: endTime });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/shifts`);
  return { error: null };
}

export async function deleteShiftTemplate(businessId: string, shiftTemplateId: string) {
  const supabase = await createClient();
  await supabase
    .from("shift_templates")
    .delete()
    .eq("id", shiftTemplateId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/shifts`);
}

export async function setShiftAssignment(
  businessId: string,
  employeeId: string,
  date: string,
  shiftTemplateId: string | null,
) {
  const supabase = await createClient();

  if (!shiftTemplateId) {
    await supabase
      .from("employee_shift_assignments")
      .delete()
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .eq("date", date);
  } else {
    await supabase.from("employee_shift_assignments").upsert(
      { business_id: businessId, employee_id: employeeId, date, shift_template_id: shiftTemplateId },
      { onConflict: "employee_id,date" },
    );
  }

  revalidatePath(`/business/${businessId}/shifts`);
}
