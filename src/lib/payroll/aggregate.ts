import type { createClient } from "@/lib/supabase/server";
import type { AttendanceSummary, PayrollSettings } from "./calc";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export function countDaysInclusive(start: string, end: string) {
  const [sy, sm, sd] = start.split("-").map(Number);
  const [ey, em, ed] = end.split("-").map(Number);
  const startUtc = Date.UTC(sy, sm - 1, sd);
  const endUtc = Date.UTC(ey, em - 1, ed);
  return Math.round((endUtc - startUtc) / 86_400_000) + 1;
}

function isWeekend(dateStr: string, holidays: Set<string>) {
  if (holidays.has(dateStr)) return true;
  const [y, m, d] = dateStr.split("-").map(Number);
  const dow = new Date(Date.UTC(y, m - 1, d)).getUTCDay(); // 0=Minggu, 6=Sabtu
  return dow === 0 || dow === 6;
}

export async function loadPayrollSettings(
  supabase: SupabaseServerClient,
  businessId: string,
): Promise<PayrollSettings> {
  const [{ data: business }, { data: tiers }] = await Promise.all([
    supabase
      .from("businesses")
      .select(
        "izin_deduction_mode, izin_deduction_weekday, izin_deduction_weekend, late_deduction_per_occurrence",
      )
      .eq("id", businessId)
      .single(),
    supabase
      .from("late_deduction_tiers")
      .select("threshold_minutes, amount")
      .eq("business_id", businessId)
      .order("threshold_minutes", { ascending: true }),
  ]);

  return {
    izinDeductionMode: (business?.izin_deduction_mode as "flat" | "full_day") ?? "flat",
    izinDeductionWeekday: business?.izin_deduction_weekday ?? 0,
    izinDeductionWeekend: business?.izin_deduction_weekend ?? 0,
    lateDeductionPerOccurrence: business?.late_deduction_per_occurrence ?? 0,
    lateTiers: (tiers ?? []).map((t) => ({
      thresholdMinutes: t.threshold_minutes,
      amount: t.amount,
    })),
  };
}

export async function loadAttendanceSummary(
  supabase: SupabaseServerClient,
  businessId: string,
  employeeId: string,
  periodStart: string,
  periodEnd: string,
): Promise<{ summary: AttendanceSummary; overtimeHoursTotal: number }> {
  const [{ data: rows }, { data: holidayRows }] = await Promise.all([
    supabase
      .from("attendance")
      .select("date, status, note, late, late_minutes, overtime_hours")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .gte("date", periodStart)
      .lte("date", periodEnd),
    supabase
      .from("payroll_holidays")
      .select("holiday_date")
      .eq("business_id", businessId)
      .gte("holiday_date", periodStart)
      .lte("holiday_date", periodEnd),
  ]);

  const holidays = new Set((holidayRows ?? []).map((h) => h.holiday_date));

  const summary: AttendanceSummary = {
    hadir: 0,
    izinNoted: 0,
    izinUnnotedWeekday: 0,
    izinUnnotedWeekend: 0,
    sakit: 0,
    alpa: 0,
    off: 0,
    periodTotalDays: countDaysInclusive(periodStart, periodEnd),
    lateMinutesList: [],
  };
  let overtimeHoursTotal = 0;

  for (const row of rows ?? []) {
    switch (row.status) {
      case "hadir":
        summary.hadir += 1;
        if (row.late) summary.lateMinutesList.push(row.late_minutes ?? 0);
        overtimeHoursTotal += Number(row.overtime_hours ?? 0);
        break;
      case "izin":
        if (row.note && row.note.trim()) {
          summary.izinNoted += 1;
        } else if (isWeekend(row.date, holidays)) {
          summary.izinUnnotedWeekend += 1;
        } else {
          summary.izinUnnotedWeekday += 1;
        }
        break;
      case "sakit":
        summary.sakit += 1;
        break;
      case "alpa":
        summary.alpa += 1;
        break;
      case "off":
        summary.off += 1;
        break;
    }
  }

  return { summary, overtimeHoursTotal: Math.round(overtimeHoursTotal * 100) / 100 };
}
