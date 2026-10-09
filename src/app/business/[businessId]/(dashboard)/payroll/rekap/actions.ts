"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadAttendanceSummary, loadPayrollSettings } from "@/lib/payroll/aggregate";
import { reimbursementCategoryLabel } from "@/lib/reimbursement/categories";
import { calcPayslip, type EmployeePayrollInput } from "@/lib/payroll/calc";
import { BUSINESS_OVERTIME_COLUMNS, overtimePayForPayslip } from "@/lib/payroll/overtime";
import {
  BUSINESS_STATUTORY_COLUMNS,
  EMPLOYEE_STATUTORY_COLUMNS,
  calcStatutory,
  statutoryConfig,
} from "@/lib/payroll/statutory";

export type CreatePayslipState = { error: string | null };

export async function createPayslip(
  businessId: string,
  employeeId: string,
  _prevState: CreatePayslipState,
  formData: FormData,
): Promise<CreatePayslipState> {
  const periodStart = formData.get("period_start") as string;
  const periodEnd = formData.get("period_end") as string;
  const thrAmount = Number(formData.get("thr_amount") ?? 0) || 0;
  const lemburHoursRaw = formData.get("lembur_hours");

  if (!periodStart || !periodEnd || periodStart > periodEnd) {
    return { error: "Periode tidak valid." };
  }

  const supabase = await createClient();

  const [
    { data: employee },
    { data: business },
    settings,
    { summary, overtimeHoursTotal, overtimeHoursPerDay },
    { data: recurringAllowances },
  ] = await Promise.all([
    supabase
      .from("employees")
      .select(
        `salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ${EMPLOYEE_STATUTORY_COLUMNS}`,
      )
      .eq("id", employeeId)
      .eq("business_id", businessId)
      .single(),
    supabase
      .from("businesses")
      .select(`lembur_rate_per_hour, ${BUSINESS_STATUTORY_COLUMNS}, ${BUSINESS_OVERTIME_COLUMNS}`)
      .eq("id", businessId)
      .single(),
    loadPayrollSettings(supabase, businessId),
    loadAttendanceSummary(supabase, businessId, employeeId, periodStart, periodEnd),
    supabase
      .from("employee_recurring_allowances")
      .select("label, amount")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .eq("active", true)
      .gt("amount", 0),
  ]);

  if (!employee) return { error: "Karyawan tidak ditemukan." };

  const lemburHours =
    lemburHoursRaw !== null && lemburHoursRaw !== "" ? Number(lemburHoursRaw) : overtimeHoursTotal;

  const empInput: EmployeePayrollInput = {
    salaryType: employee.salary_type as "harian" | "bulanan",
    dailyRate: employee.daily_rate,
    monthlyRate: employee.monthly_rate,
    dailyMealAllowance: employee.daily_meal_allowance,
    dailyAttendanceAllowance: employee.daily_attendance_allowance,
    lemburRatePerHour: employee.lembur_rate_per_hour ?? business?.lembur_rate_per_hour ?? 0,
  };

  const recurringAllowanceTotal = (recurringAllowances ?? []).reduce(
    (sum, r) => sum + r.amount,
    0,
  );
  // Flat (jam × tarif) atau PP 35/2021 (per hari, 1,5×/2×) — lib/payroll/overtime.ts.
  const lemburPay = overtimePayForPayslip({
    business,
    employee: {
      salaryType: empInput.salaryType,
      dailyRate: empInput.dailyRate,
      monthlyRate: empInput.monthlyRate,
      flatRatePerHour: empInput.lemburRatePerHour,
    },
    recurringAllowanceTotal,
    hoursPerDay: overtimeHoursPerDay,
    totalHours: lemburHours,
  });

  const result = calcPayslip(empInput, summary, settings, lemburHours, thrAmount, lemburPay.amount);

  // BPJS & PPh 21 (keduanya opsional per bisnis) — lihat lib/payroll/statutory.ts.
  const statutory = calcStatutory({
    result,
    recurringAllowanceTotal,
    ...statutoryConfig(business, employee),
  });
  const pph21Amount = statutory.pph21?.amount ?? 0;
  const ptkpStatusSnapshot = statutory.pph21 ? employee.ptkp_status : null;
  const terCategorySnapshot = statutory.pph21?.category ?? null;
  const bpjsEnabled = business?.bpjs_enabled ?? false;

  const { data: payslip, error } = await supabase
    .from("payslips")
    .insert({
      business_id: businessId,
      employee_id: employeeId,
      period_start: periodStart,
      period_end: periodEnd,
      salary_type: empInput.salaryType,
      daily_rate: empInput.dailyRate,
      monthly_rate: empInput.monthlyRate,
      hadir_count: summary.hadir,
      izin_noted_count: result.izinNotedCount,
      izin_unnoted_count: result.izinUnnotedCount,
      sakit_count: summary.sakit,
      alpa_count: summary.alpa,
      off_count: summary.off,
      late_count: result.lateCount,
      hari_kerja_efektif: result.hariKerjaEfektif,
      base_pay: result.basePay,
      meal_allowance: result.mealAllowance,
      attendance_allowance: result.attendanceAllowance,
      lembur_hours: lemburHours,
      lembur_rate: lemburPay.ratePerHour,
      lembur_amount: result.lemburAmount,
      thr_amount: result.thrAmount,
      izin_deduction: result.izinDeduction,
      late_deduction: result.lateDeduction,
      kasbon_deduction: 0,
      personal_loan_deduction: 0,
      pph21_amount: pph21Amount,
      ptkp_status: ptkpStatusSnapshot,
      ter_category: terCategorySnapshot,
      bpjs_employee_amount: statutory.bpjs.employee.total,
      bpjs_employer_amount: statutory.bpjs.employer.total,
      bpjs_detail: bpjsEnabled ? statutory.bpjs : null,
    })
    .select("id")
    .single();

  if (error || !payslip) {
    return { error: error?.message ?? "Gagal membuat slip gaji." };
  }

  // Tunjangan tetap (recurring allowances) disalin sekali di sini sebagai
  // payslip_adjustments biasa — pure snapshot-on-copy, tidak dilink balik ke
  // template-nya, jadi mengubah/menonaktifkan template tidak pernah mengubah
  // slip yang sudah dibuat.
  if (recurringAllowances && recurringAllowances.length > 0) {
    await supabase.from("payslip_adjustments").insert(
      recurringAllowances.map((r) => ({
        payslip_id: payslip.id,
        type: "tunjangan" as const,
        label: r.label,
        amount: r.amount,
      })),
    );
  }

  // Reimbursement yang sudah disetujui dan belum pernah masuk slip ikut
  // disalin sebagai tunjangan (ditambahkan setelah hitung PPh21/BPJS di atas,
  // jadi tidak kena pajak/iuran). payslip_id diisi supaya tidak dibayar dobel.
  const { data: approvedClaims } = await supabase
    .from("reimbursements")
    .select("id, category, amount, description")
    .eq("business_id", businessId)
    .eq("employee_id", employeeId)
    .eq("status", "approved")
    .is("payslip_id", null)
    .lte("date", periodEnd);
  if (approvedClaims && approvedClaims.length > 0) {
    const { error: claimError } = await supabase.from("payslip_adjustments").insert(
      approvedClaims.map((c) => ({
        payslip_id: payslip.id,
        type: "tunjangan" as const,
        label: `Reimbursement ${reimbursementCategoryLabel(c.category)}${c.description ? ` – ${c.description}` : ""}`.slice(0, 120),
        amount: Number(c.amount),
      })),
    );
    if (!claimError) {
      await supabase
        .from("reimbursements")
        .update({ payslip_id: payslip.id })
        .in(
          "id",
          approvedClaims.map((c) => c.id),
        );
    }
  }

  redirect(`/business/${businessId}/payroll/${payslip.id}`);
}
