"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

const PTKP_STATUSES = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];

function numOrZero(v: FormDataEntryValue | null) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function createEmployee(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const salaryType = formData.get("salary_type") as string;
  const note = ((formData.get("note") as string) || "").trim() || null;
  const email = ((formData.get("email") as string) || "").trim() || null;
  const contractEnd = (formData.get("contract_end") as string) || null;
  const ptkpStatus = (formData.get("ptkp_status") as string) || "TK/0";

  if (!name) return { error: "Nama karyawan wajib diisi." };
  if (salaryType !== "harian" && salaryType !== "bulanan") {
    return { error: "Tipe gaji tidak valid." };
  }
  if (!PTKP_STATUSES.includes(ptkpStatus)) {
    return { error: "Status PTKP tidak valid." };
  }

  const { error } = await supabase.from("employees").insert({
    business_id: businessId,
    name,
    salary_type: salaryType,
    daily_rate: numOrZero(formData.get("daily_rate")),
    monthly_rate: numOrZero(formData.get("monthly_rate")),
    note,
    email,
    contract_end: contractEnd,
    ptkp_status: ptkpStatus,
    daily_meal_allowance: numOrZero(formData.get("daily_meal_allowance")),
    daily_attendance_allowance: numOrZero(formData.get("daily_attendance_allowance")),
    lembur_rate_per_hour: formData.get("lembur_rate_per_hour")
      ? numOrZero(formData.get("lembur_rate_per_hour"))
      : null,
  });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/employees`);
  return { error: null };
}

export async function updateEmployee(
  businessId: string,
  employeeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const salaryType = formData.get("salary_type") as string;
  const note = ((formData.get("note") as string) || "").trim() || null;
  const email = ((formData.get("email") as string) || "").trim() || null;
  const contractEnd = (formData.get("contract_end") as string) || null;
  const ptkpStatus = (formData.get("ptkp_status") as string) || "TK/0";

  if (!name) return { error: "Nama karyawan wajib diisi." };
  if (salaryType !== "harian" && salaryType !== "bulanan") {
    return { error: "Tipe gaji tidak valid." };
  }
  if (!PTKP_STATUSES.includes(ptkpStatus)) {
    return { error: "Status PTKP tidak valid." };
  }

  const { error } = await supabase
    .from("employees")
    .update({
      name,
      salary_type: salaryType,
      daily_rate: numOrZero(formData.get("daily_rate")),
      monthly_rate: numOrZero(formData.get("monthly_rate")),
      note,
      email,
      contract_end: contractEnd,
      ptkp_status: ptkpStatus,
      daily_meal_allowance: numOrZero(formData.get("daily_meal_allowance")),
      daily_attendance_allowance: numOrZero(formData.get("daily_attendance_allowance")),
      lembur_rate_per_hour: formData.get("lembur_rate_per_hour")
        ? numOrZero(formData.get("lembur_rate_per_hour"))
        : null,
    })
    .eq("id", employeeId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/employees`);
  return { error: null };
}

export async function setEmployeeActive(businessId: string, employeeId: string, active: boolean) {
  const supabase = await createClient();
  await supabase
    .from("employees")
    .update({ active })
    .eq("id", employeeId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/employees`);
}

// Soft delete — baris tidak dihapus fisik supaya attendance/payslip lama
// tetap punya referensi employee_id yang valid.
export async function softDeleteEmployee(businessId: string, employeeId: string) {
  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("name")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .single();

  await supabase
    .from("employees")
    .update({ deleted_at: new Date().toISOString(), active: false })
    .eq("id", employeeId)
    .eq("business_id", businessId);

  await logActivity(supabase, businessId, "Karyawan dihapus", employee?.name);

  revalidatePath(`/business/${businessId}/employees`);
}
