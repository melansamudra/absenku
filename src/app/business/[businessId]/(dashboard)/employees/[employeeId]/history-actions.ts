"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { recordSalaryChange } from "@/lib/employee/history";

export type AdjustState = { error: string | null };

const num = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Penyesuaian Gaji: ubah gaji aktif karyawan + catat riwayatnya. Berlaku langsung di payroll berikutnya. */
export async function adjustSalary(
  businessId: string,
  employeeId: string,
  _prev: AdjustState,
  fd: FormData,
): Promise<AdjustState> {
  const salaryType = (fd.get("salary_type") as string) || "";
  if (salaryType !== "harian" && salaryType !== "bulanan") return { error: "Tipe gaji tidak valid." };
  const effective = ((fd.get("effective_date") as string) || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(effective)) return { error: "Tanggal efektif wajib diisi." };
  const rate = salaryType === "harian" ? num(fd, "daily_rate") : num(fd, "monthly_rate");
  if (rate <= 0) return { error: "Nominal gaji harus lebih dari 0." };
  const note = ((fd.get("note") as string) || "").trim() || null;

  const supabase = await createClient();
  const { data: before } = await supabase
    .from("employees")
    .select("name, salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!before) return { error: "Karyawan tidak ditemukan." };

  const after = {
    salary_type: salaryType,
    daily_rate: salaryType === "harian" ? rate : 0,
    monthly_rate: salaryType === "bulanan" ? rate : 0,
    daily_meal_allowance: num(fd, "daily_meal_allowance"),
    daily_attendance_allowance: num(fd, "daily_attendance_allowance"),
  };

  const { error } = await supabase.from("employees").update(after).eq("id", employeeId).eq("business_id", businessId);
  if (error) return { error: error.message };

  await recordSalaryChange(supabase, businessId, employeeId, before, after, effective, note ?? "Penyesuaian gaji");
  await logActivity(supabase, businessId, "Gaji karyawan disesuaikan", before.name);

  revalidatePath(`/business/${businessId}/employees/${employeeId}`);
  revalidatePath(`/business/${businessId}/employees`);
  return { error: null };
}
