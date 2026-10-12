// Estimasi gaji BERJALAN (sebelum slip dibuat) untuk Ringkasan Gaji.
//
// Dua tampilan dari rumus yang sama dengan slip (calcPayslip):
//  - "berjalan": hanya absensi sampai `asOf`. Pembagi gaji bulanan tetap hari kerja
//    SEBULAN PENUH, jadi tanggal 10 gaji pokok ≈ 10/26 dari gaji bulanan (bukan penuh).
//  - "proyeksi": sisa hari kerja setelah `asOf` dianggap hadir normal (tanpa telat/izin/lembur).
import type { createClient } from "@/lib/supabase/server";
import { loadAttendanceSummary, loadPayrollSettings } from "./aggregate";
import { calcPayslip, type AttendanceSummary, type EmployeePayrollInput } from "./calc";
import { BUSINESS_OVERTIME_COLUMNS, overtimePayForPayslip } from "./overtime";
import { BUSINESS_STATUTORY_COLUMNS, EMPLOYEE_STATUTORY_COLUMNS, calcStatutory, statutoryConfig } from "./statutory";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type EstimateLine = {
  basePay: number;
  meal: number;
  attendance: number;
  lembur: number;
  tunjanganLain: number;
  potongan: number;
  pph21: number;
  bpjs: number;
  net: number;
};

export type EstimateRow = {
  employeeId: string;
  name: string;
  code: string | null;
  running: EstimateLine;
  projected: EstimateLine;
};

/** Tambahkan `remaining` hari kerja sebagai hari hadir normal. Pure. */
export function projectSummary(summary: AttendanceSummary, remaining: number): AttendanceSummary {
  return { ...summary, hadir: summary.hadir + Math.max(0, remaining) };
}

export function remainingWorkdays(scheduledDates: Iterable<string>, asOf: string): number {
  let n = 0;
  for (const d of scheduledDates) if (d > asOf) n += 1;
  return n;
}

function monthEnd(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

export async function loadSalaryEstimates(
  supabase: SupabaseServerClient,
  businessId: string,
  month: string,
  asOf: string,
  /** Karyawan yang sudah punya slip bulan itu — dilewati (pakai angka slip asli). */
  skipEmployeeIds: Set<string>,
): Promise<{ rows: EstimateRow[]; remainingDays: number }> {
  const start = `${month}-01`;
  const end = monthEnd(month);
  // Absensi dibaca paling jauh sampai `asOf`; bulan yang sudah lewat dibaca penuh.
  const readEnd = asOf < start ? start : asOf > end ? end : asOf;

  const [{ data: employees }, { data: business }, settings, { data: recurring }] = await Promise.all([
    supabase
      .from("employees")
      .select(
        `id, name, employee_code, salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ${EMPLOYEE_STATUTORY_COLUMNS}`,
      )
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("businesses")
      .select(`lembur_rate_per_hour, ${BUSINESS_STATUTORY_COLUMNS}, ${BUSINESS_OVERTIME_COLUMNS}`)
      .eq("id", businessId)
      .single(),
    loadPayrollSettings(supabase, businessId),
    supabase
      .from("employee_recurring_allowances")
      .select("employee_id, amount")
      .eq("business_id", businessId)
      .eq("active", true)
      .gt("amount", 0),
  ]);

  const recurringBy = new Map<string, number>();
  for (const r of recurring ?? []) recurringBy.set(r.employee_id, (recurringBy.get(r.employee_id) ?? 0) + r.amount);

  let remainingDays = 0;
  const rows: EstimateRow[] = [];
  for (const e of (employees ?? []).filter((x) => !skipEmployeeIds.has(x.id))) {
    const { summary, overtimeHoursTotal, overtimeHoursPerDay, scheduledDates } = await loadAttendanceSummary(
      supabase,
      businessId,
      e.id,
      start,
      readEnd,
      end,
    );
    // Sisa hari kerja hanya ada bila `asOf` masih di dalam bulan itu.
    const remaining = asOf >= end ? 0 : remainingWorkdays(scheduledDates, asOf < start ? "0000-00-00" : asOf);
    remainingDays = remaining;

    const empInput: EmployeePayrollInput = {
      salaryType: e.salary_type as "harian" | "bulanan",
      dailyRate: e.daily_rate,
      monthlyRate: e.monthly_rate,
      dailyMealAllowance: e.daily_meal_allowance,
      dailyAttendanceAllowance: e.daily_attendance_allowance,
      lemburRatePerHour: e.lembur_rate_per_hour ?? business?.lembur_rate_per_hour ?? 0,
    };
    const tunj = recurringBy.get(e.id) ?? 0;

    const line = (sum: AttendanceSummary): EstimateLine => {
      const lemburPay = overtimePayForPayslip({
        business,
        employee: {
          salaryType: empInput.salaryType,
          dailyRate: empInput.dailyRate,
          monthlyRate: empInput.monthlyRate,
          flatRatePerHour: empInput.lemburRatePerHour,
        },
        recurringAllowanceTotal: tunj,
        hoursPerDay: overtimeHoursPerDay,
        totalHours: overtimeHoursTotal,
      });
      const r = calcPayslip(empInput, sum, settings, overtimeHoursTotal, 0, lemburPay.amount);
      const st = calcStatutory({ result: r, recurringAllowanceTotal: tunj, ...statutoryConfig(business, e) });
      const pph21 = st.pph21?.amount ?? 0;
      const bpjs = st.bpjs.employee.total;
      const potongan = r.izinDeduction + r.lateDeduction;
      return {
        basePay: r.basePay,
        meal: r.mealAllowance,
        attendance: r.attendanceAllowance,
        lembur: r.lemburAmount,
        tunjanganLain: tunj,
        potongan,
        pph21,
        bpjs,
        net: r.basePay + r.mealAllowance + r.attendanceAllowance + r.lemburAmount + tunj - potongan - pph21 - bpjs,
      };
    };

    rows.push({
      employeeId: e.id,
      name: e.name,
      code: e.employee_code ?? null,
      running: line(summary),
      projected: line(projectSummary(summary, remaining)),
    });
  }
  return { rows, remainingDays };
}
