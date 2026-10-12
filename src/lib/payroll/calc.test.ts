import { describe, expect, it } from "vitest";
import { calcPayslip, type AttendanceSummary, type EmployeePayrollInput, type PayrollSettings } from "./calc";

const settings: PayrollSettings = {
  izinDeductionMode: "full_day",
  izinDeductionWeekday: 0,
  izinDeductionWeekend: 0,
  lateDeductionPerOccurrence: 0,
  lateTiers: [
    { thresholdMinutes: 15, amount: 10000 },
    { thresholdMinutes: 30, amount: 25000 },
    { thresholdMinutes: 60, amount: 50000 },
  ],
};
const att = (over: Partial<AttendanceSummary> = {}): AttendanceSummary => ({
  hadir: 0, izinNoted: 0, izinUnnotedWeekday: 0, izinUnnotedWeekend: 0, sakit: 0, alpa: 0, off: 0,
  periodTotalDays: 25, lateMinutesList: [], ...over,
});
const monthly = (rate = 4_500_000): EmployeePayrollInput => ({ salaryType: "bulanan", dailyRate: 0, monthlyRate: rate, dailyMealAllowance: 0, dailyAttendanceAllowance: 0, lemburRatePerHour: 0 });
const daily = (rate = 150_000): EmployeePayrollInput => ({ salaryType: "harian", dailyRate: rate, monthlyRate: 0, dailyMealAllowance: 15_000, dailyAttendanceAllowance: 5_000, lemburRatePerHour: 0 });

describe("gaji bulanan", () => {
  it("hadir di semua hari kerja → menerima gaji bulanan penuh", () => {
    expect(calcPayslip(monthly(), att({ hadir: 25 }), settings, 0, 0).basePay).toBe(4_500_000);
  });
  it("izin dengan keterangan & sakit tetap dibayar penuh", () => {
    expect(calcPayslip(monthly(), att({ hadir: 22, izinNoted: 2, sakit: 1 }), settings, 0, 0).basePay).toBe(4_500_000);
  });
  it("alpa memotong sebesar satu hari gaji (4.500.000 ÷ 25 = 180.000)", () => {
    expect(calcPayslip(monthly(), att({ hadir: 24, alpa: 1 }), settings, 0, 0).basePay).toBe(4_320_000);
  });
  it("hari 'off' di hari kerja mengecilkan pembagi, bukan gaji", () => {
    expect(calcPayslip(monthly(), att({ hadir: 24, off: 1 }), settings, 0, 0).basePay).toBe(4_500_000);
  });
  it("hadir di hari libur mingguan tidak membuat gaji melebihi gaji bulanan", () => {
    expect(calcPayslip(monthly(), att({ hadir: 28 }), settings, 0, 0).basePay).toBe(4_500_000);
  });
  it("izin tanpa keterangan (mode hari penuh) → dibayar lalu dipotong sehari", () => {
    const r = calcPayslip(monthly(), att({ hadir: 24, izinUnnotedWeekday: 1 }), settings, 0, 0);
    expect(r.basePay).toBe(4_500_000);
    expect(r.izinDeduction).toBe(180_000);
    expect(r.subtotal).toBe(4_320_000);
  });
});

describe("gaji harian", () => {
  it("dibayar per hari hadir + sakit + izin berketerangan", () => {
    expect(calcPayslip(daily(), att({ hadir: 20, sakit: 2, izinNoted: 1 }), settings, 0, 0).basePay).toBe(3_450_000);
  });
  it("uang makan & tunjangan hadir hanya untuk hari hadir", () => {
    const r = calcPayslip(daily(), att({ hadir: 20, sakit: 2 }), settings, 0, 0);
    expect(r.mealAllowance).toBe(300_000);
    expect(r.attendanceAllowance).toBe(100_000);
  });
  it("alpa tidak dibayar", () => {
    expect(calcPayslip(daily(), att({ hadir: 20, alpa: 3 }), settings, 0, 0).basePay).toBe(3_000_000);
  });
});

describe("potongan telat bertingkat", () => {
  it("memakai tingkat tertinggi yang terlampaui per hari", () => {
    const r = calcPayslip(daily(), att({ hadir: 5, lateMinutesList: [5, 15, 29, 30, 75] }), settings, 0, 0);
    expect(r.lateCount).toBe(5);
    expect(r.lateDeduction).toBe(0 + 10_000 + 10_000 + 25_000 + 50_000);
  });
  it("tanpa tingkat → tarif per kejadian", () => {
    const flat: PayrollSettings = { ...settings, lateTiers: [], lateDeductionPerOccurrence: 20_000 };
    expect(calcPayslip(daily(), att({ hadir: 5, lateMinutesList: [3, 40] }), flat, 0, 0).lateDeduction).toBe(40_000);
  });
});

describe("lembur & THR", () => {
  it("lembur override (mis. PP 35) dipakai apa adanya", () => {
    expect(calcPayslip(daily(), att({ hadir: 1 }), settings, 2, 0, 123_456).lemburAmount).toBe(123_456);
  });
  it("lembur flat = jam × tarif", () => {
    expect(calcPayslip({ ...daily(), lemburRatePerHour: 20_000 }, att({ hadir: 1 }), settings, 2.5, 0).lemburAmount).toBe(50_000);
  });
  it("THR masuk ke subtotal", () => {
    expect(calcPayslip(daily(), att({ hadir: 1 }), settings, 0, 500_000).subtotal).toBe(150_000 + 15_000 + 5_000 + 500_000);
  });
});
