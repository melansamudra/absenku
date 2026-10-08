// Rumus perhitungan slip gaji — pure functions, tidak menyentuh database.
// Dipakai di halaman rekap payroll (pratinjau sebelum slip dibuat) dan saat
// slip benar-benar disimpan, supaya keduanya selalu pakai logika yang sama.
//
// Prinsip snapshot-on-create: hasil fungsi ini disalin ke kolom `payslips`
// saat slip dibuat, dan TIDAK dihitung ulang setelahnya — slip yang sudah
// ada tidak boleh berubah diam-diam kalau data master (tarif gaji, aturan
// potongan) berubah belakangan.

export type AttendanceSummary = {
  hadir: number;
  izinNoted: number;
  izinUnnotedWeekday: number;
  izinUnnotedWeekend: number;
  sakit: number;
  alpa: number;
  off: number;
  periodTotalDays: number;
  lateMinutesList: number[]; // satu entri per hari 'hadir' yang ditandai telat
};

export type PayrollSettings = {
  izinDeductionMode: "flat" | "full_day";
  izinDeductionWeekday: number;
  izinDeductionWeekend: number;
  lateDeductionPerOccurrence: number;
  lateTiers: { thresholdMinutes: number; amount: number }[];
};

export type EmployeePayrollInput = {
  salaryType: "harian" | "bulanan";
  dailyRate: number;
  monthlyRate: number;
  dailyMealAllowance: number;
  dailyAttendanceAllowance: number;
  lemburRatePerHour: number;
};

export type PayslipCalcResult = {
  dailyEquivalent: number;
  hariKerjaEfektif: number;
  izinNotedCount: number;
  izinUnnotedCount: number;
  basePay: number;
  mealAllowance: number;
  attendanceAllowance: number;
  izinDeduction: number;
  lateCount: number;
  lateDeduction: number;
  lemburAmount: number;
  thrAmount: number;
  /** base_pay + tunjangan + lembur + thr − potongan izin/telat (belum dikurangi adjustment/kasbon manual) */
  subtotal: number;
};

function lateDeductionForDay(lateMinutes: number, settings: PayrollSettings): number {
  if (settings.lateTiers.length === 0) {
    return settings.lateDeductionPerOccurrence;
  }
  const applicable = settings.lateTiers
    .filter((t) => lateMinutes >= t.thresholdMinutes)
    .sort((a, b) => b.thresholdMinutes - a.thresholdMinutes);
  return applicable[0]?.amount ?? 0;
}

export function calcPayslip(
  emp: EmployeePayrollInput,
  att: AttendanceSummary,
  settings: PayrollSettings,
  lemburHours: number,
  thrAmount: number,
  /** Upah lembur yang sudah dihitung (mis. mode PP 35); kosong = jam × tarif flat. */
  lemburAmountOverride?: number,
): PayslipCalcResult {
  const hariKerjaEfektif = Math.max(1, att.periodTotalDays - att.off);

  const dailyEquivalent =
    emp.salaryType === "harian" ? emp.dailyRate : emp.monthlyRate / hariKerjaEfektif;

  const izinUnnottedCount = att.izinUnnotedWeekday + att.izinUnnotedWeekend;
  const paidDays = att.hadir + att.sakit + att.izinNoted + izinUnnottedCount;
  const basePay = Math.round(dailyEquivalent * paidDays);

  const mealAllowance = Math.round(att.hadir * emp.dailyMealAllowance);
  const attendanceAllowance = Math.round(att.hadir * emp.dailyAttendanceAllowance);

  const izinDeduction =
    settings.izinDeductionMode === "full_day"
      ? Math.round(izinUnnottedCount * dailyEquivalent)
      : Math.round(
          att.izinUnnotedWeekday * settings.izinDeductionWeekday +
            att.izinUnnotedWeekend * settings.izinDeductionWeekend,
        );

  const lateCount = att.lateMinutesList.length;
  const lateDeduction = Math.round(
    att.lateMinutesList.reduce((sum, mins) => sum + lateDeductionForDay(mins, settings), 0),
  );

  const lemburAmount =
    lemburAmountOverride ?? Math.round(lemburHours * emp.lemburRatePerHour);

  const subtotal =
    basePay +
    mealAllowance +
    attendanceAllowance +
    lemburAmount +
    thrAmount -
    izinDeduction -
    lateDeduction;

  return {
    dailyEquivalent,
    hariKerjaEfektif,
    izinNotedCount: att.izinNoted,
    izinUnnotedCount: izinUnnottedCount,
    basePay,
    mealAllowance,
    attendanceAllowance,
    izinDeduction,
    lateCount,
    lateDeduction,
    lemburAmount,
    thrAmount,
    subtotal,
  };
}
