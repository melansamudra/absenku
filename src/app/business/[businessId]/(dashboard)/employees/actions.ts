"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { hashPin, PIN_PATTERN } from "@/lib/attendance/pin";

export type ActionState = { error: string | null };

const PTKP_STATUSES = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];

// PIN absen dari form: kosong = tidak diubah (undefined), centang "hapus PIN"
// = null, selain itu harus 4–6 digit dan disimpan sebagai hash.
async function readPinUpdate(
  formData: FormData,
): Promise<{ error: string } | { value: string | null | undefined }> {
  if (formData.get("remove_attendance_pin") === "on") return { value: null };
  const pin = ((formData.get("attendance_pin") as string) || "").trim();
  if (!pin) return { value: undefined };
  if (!PIN_PATTERN.test(pin)) return { error: "PIN absen harus 4–6 digit angka." };
  return { value: await hashPin(pin) };
}

function bpjsFields(formData: FormData) {
  const raw = ((formData.get("bpjs_wage_base") as string) || "").trim();
  const wageBase = raw ? Number(raw) : null;
  return {
    bpjs_kesehatan: formData.get("bpjs_kesehatan") === "on",
    bpjs_ketenagakerjaan: formData.get("bpjs_ketenagakerjaan") === "on",
    bpjs_wage_base: wageBase !== null && Number.isFinite(wageBase) && wageBase > 0 ? wageBase : null,
  };
}

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
  const pinUpdate = await readPinUpdate(formData);
  if ("error" in pinUpdate) return pinUpdate;

  const { error } = await supabase.from("employees").insert({
    attendance_pin_hash: pinUpdate.value ?? null,
    business_id: businessId,
    name,
    salary_type: salaryType,
    daily_rate: numOrZero(formData.get("daily_rate")),
    monthly_rate: numOrZero(formData.get("monthly_rate")),
    note,
    email,
    contract_end: contractEnd,
    ptkp_status: ptkpStatus,
    ...bpjsFields(formData),
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
  const pinUpdate = await readPinUpdate(formData);
  if ("error" in pinUpdate) return pinUpdate;

  const { error } = await supabase
    .from("employees")
    .update({
      ...(pinUpdate.value !== undefined && { attendance_pin_hash: pinUpdate.value }),
      name,
      salary_type: salaryType,
      daily_rate: numOrZero(formData.get("daily_rate")),
      monthly_rate: numOrZero(formData.get("monthly_rate")),
      note,
      email,
      contract_end: contractEnd,
      ptkp_status: ptkpStatus,
      ...bpjsFields(formData),
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
