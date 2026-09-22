import { createClient } from "@/lib/supabase/server";
import { loadAttendanceSummary, loadPayrollSettings } from "@/lib/payroll/aggregate";
import { calcPayslip, type EmployeePayrollInput } from "@/lib/payroll/calc";
import { calculatePph21, type PtkpStatus } from "@/lib/payroll/pph21";
import RekapRow from "./rekap-row";

function currentMonthRange() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const [y, m] = today.split("-");
  const start = `${y}-${m}-01`;
  const lastDay = new Date(Number(y), Number(m), 0).getDate();
  const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export default async function PayrollRekapPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { businessId } = await params;
  const { start: startParam, end: endParam } = await searchParams;
  const defaultRange = currentMonthRange();
  const periodStart = startParam || defaultRange.start;
  const periodEnd = endParam || defaultRange.end;

  const supabase = await createClient();

  const [{ data: employees }, { data: business }, settings, { data: existingSlips }, { data: recurringAllowances }] =
    await Promise.all([
      supabase
        .from("employees")
        .select(
          "id, name, salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ptkp_status",
        )
        .eq("business_id", businessId)
        .eq("active", true)
        .is("deleted_at", null)
        .order("created_at", { ascending: true }),
      supabase
        .from("businesses")
        .select("lembur_rate_per_hour, pph21_enabled")
        .eq("id", businessId)
        .single(),
      loadPayrollSettings(supabase, businessId),
      supabase
        .from("payslips")
        .select("id, employee_id")
        .eq("business_id", businessId)
        .eq("period_start", periodStart)
        .eq("period_end", periodEnd),
      supabase
        .from("employee_recurring_allowances")
        .select("employee_id, amount")
        .eq("business_id", businessId)
        .eq("active", true)
        .gt("amount", 0),
    ]);

  const existingByEmployee = new Map((existingSlips ?? []).map((p) => [p.employee_id, p.id]));

  const recurringByEmployee = new Map<string, { count: number; total: number }>();
  for (const r of recurringAllowances ?? []) {
    const entry = recurringByEmployee.get(r.employee_id) ?? { count: 0, total: 0 };
    entry.count += 1;
    entry.total += r.amount;
    recurringByEmployee.set(r.employee_id, entry);
  }

  const rows = await Promise.all(
    (employees ?? []).map(async (e) => {
      const { summary, overtimeHoursTotal } = await loadAttendanceSummary(
        supabase,
        businessId,
        e.id,
        periodStart,
        periodEnd,
      );
      const empInput: EmployeePayrollInput = {
        salaryType: e.salary_type as "harian" | "bulanan",
        dailyRate: e.daily_rate,
        monthlyRate: e.monthly_rate,
        dailyMealAllowance: e.daily_meal_allowance,
        dailyAttendanceAllowance: e.daily_attendance_allowance,
        lemburRatePerHour: e.lembur_rate_per_hour ?? business?.lembur_rate_per_hour ?? 0,
      };
      const result = calcPayslip(empInput, summary, settings, overtimeHoursTotal, 0);
      const recurring = recurringByEmployee.get(e.id) ?? { count: 0, total: 0 };

      let pph21Estimate = 0;
      if (business?.pph21_enabled) {
        const grossForTax = Math.max(
          0,
          result.basePay +
            result.mealAllowance +
            result.attendanceAllowance +
            result.lemburAmount +
            recurring.total -
            result.izinDeduction -
            result.lateDeduction,
        );
        pph21Estimate = calculatePph21(grossForTax, e.ptkp_status as PtkpStatus).amount;
      }

      return {
        employeeId: e.id,
        employeeName: e.name,
        defaultOvertimeHours: overtimeHoursTotal,
        existingPayslipId: existingByEmployee.get(e.id) ?? null,
        recurringAllowanceCount: recurring.count,
        recurringAllowanceTotal: recurring.total,
        pph21Estimate,
        preview: {
          hadir: summary.hadir,
          izin: summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend,
          sakit: summary.sakit,
          alpa: summary.alpa,
          off: summary.off,
          subtotal: result.subtotal - pph21Estimate,
        },
      };
    }),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Rekap Payroll</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Pratinjau gaji per karyawan untuk periode terpilih, lalu buat slip.
        </p>
      </div>

      <form className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Dari</label>
          <input
            type="date"
            name="start"
            defaultValue={periodStart}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Sampai</label>
          <input
            type="date"
            name="end"
            defaultValue={periodEnd}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Tampilkan
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <RekapRow
                key={row.employeeId}
                businessId={businessId}
                employeeId={row.employeeId}
                employeeName={row.employeeName}
                periodStart={periodStart}
                periodEnd={periodEnd}
                defaultOvertimeHours={row.defaultOvertimeHours}
                preview={row.preview}
                existingPayslipId={row.existingPayslipId}
                recurringAllowanceCount={row.recurringAllowanceCount}
                recurringAllowanceTotal={row.recurringAllowanceTotal}
                pph21Estimate={row.pph21Estimate}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
