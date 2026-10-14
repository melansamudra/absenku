"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type CreateAdhocPayslipState = { error: string | null };

/**
 * Buat slip gaji Tidak Tetap: TANPA lewat buildPayslip()/loadAttendanceSummary
 * — semua kolom kehadiran & nominal dasar tetap default 0 di database,
 * komponennya diisi belakangan lewat payslip_adjustments (tunjangan/potongan
 * bebas) yang sudah ada di halaman detail slip. Dipakai untuk bonus proyek,
 * pesangon, atau pembayaran off-cycle lain yang tidak dihitung dari absensi.
 */
export async function createAdhocPayslip(
  businessId: string,
  _prevState: CreateAdhocPayslipState,
  formData: FormData,
): Promise<CreateAdhocPayslipState> {
  const employeeId = formData.get("employee_id") as string;
  const periodStart = formData.get("period_start") as string;
  const periodEnd = formData.get("period_end") as string;
  const note = ((formData.get("note") as string) || "").trim() || null;

  if (!employeeId) return { error: "Karyawan wajib dipilih." };
  if (!periodStart || !periodEnd || periodEnd < periodStart) return { error: "Periode tidak valid." };

  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select("salary_type, daily_rate, monthly_rate")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .single();

  if (!employee) return { error: "Karyawan tidak ditemukan." };

  const { data: payslip, error } = await supabase
    .from("payslips")
    .insert({
      business_id: businessId,
      employee_id: employeeId,
      period_start: periodStart,
      period_end: periodEnd,
      salary_type: employee.salary_type,
      daily_rate: employee.daily_rate,
      monthly_rate: employee.monthly_rate,
      slip_type: "tidak_tetap",
      note,
    })
    .select("id")
    .single();

  if (error || !payslip) return { error: error?.message ?? "Gagal membuat slip." };

  redirect(`/business/${businessId}/payroll/${payslip.id}`);
}
