import { describe, expect, it } from "vitest";
import { calcPayslip, type AttendanceSummary, type EmployeePayrollInput, type PayrollSettings } from "./calc";
import { projectSummary, remainingWorkdays } from "./estimate";
import { scheduledWorkdays } from "./workdays";

const settings: PayrollSettings = {
  izinDeductionMode: "flat",
  izinDeductionWeekday: 0,
  izinDeductionWeekend: 0,
  lateDeductionPerOccurrence: 0,
  lateTiers: [],
};
const bulanan: EmployeePayrollInput = {
  salaryType: "bulanan",
  dailyRate: 0,
  monthlyRate: 2_600_000,
  dailyMealAllowance: 10_000,
  dailyAttendanceAllowance: 0,
  lemburRatePerHour: 0,
};

// September 2026: Senin–Sabtu = 26 hari kerja.
const dates = scheduledWorkdays("2026-09-01", "2026-09-30", 6);
const base = (hadir: number): AttendanceSummary => ({
  hadir,
  izinNoted: 0,
  izinUnnotedWeekday: 0,
  izinUnnotedWeekend: 0,
  sakit: 0,
  alpa: 0,
  off: 0,
  periodTotalDays: dates.size,
  lateMinutesList: [],
});

describe("estimasi gaji berjalan", () => {
  it("sebulan = 26 hari kerja; sisa hari setelah tanggal 10 = 17", () => {
    expect(dates.size).toBe(26);
    expect(remainingWorkdays(dates, "2026-09-10")).toBe(17);
    expect(remainingWorkdays(dates, "2026-09-30")).toBe(0);
  });

  it("tanggal 10: gaji pokok bulanan sebanding 9/26, bukan penuh", () => {
    const r = calcPayslip(bulanan, base(9), settings, 0, 0);
    expect(r.basePay).toBe(900_000); // 2.600.000 ÷ 26 × 9
    expect(r.mealAllowance).toBe(90_000);
  });

  it("proyeksi menambah sisa hari sebagai hadir dan menghasilkan gaji penuh", () => {
    const r = calcPayslip(bulanan, projectSummary(base(9), 17), settings, 0, 0);
    expect(r.basePay).toBe(2_600_000);
    expect(r.mealAllowance).toBe(260_000);
  });

  it("proyeksi tanpa sisa hari sama dengan berjalan", () => {
    expect(projectSummary(base(24), 0)).toEqual(base(24));
  });
});
