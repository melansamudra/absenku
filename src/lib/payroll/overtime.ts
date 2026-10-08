// Aturan lembur — pure functions, tidak menyentuh database.
//
// (1) Jam lembur per hari (dipakai saat absen pulang selfie):
//     lembur = min(waktu setelah jam pulang jadwal, total kerja − durasi shift)
//     → karyawan yang telat harus "menutup" telatnya dulu sebelum dapat lembur.
//     Lalu: di bawah batas minimum = 0, dibulatkan ke bawah per kelipatan
//     menit tertentu, dan dibatasi maksimal per hari (PP 35/2021: 4 jam).
//
// (2) Upah lembur per slip:
//     - "flat": jam lembur × tarif per jam (perilaku lama).
//     - "pp35": PP 35/2021 untuk hari kerja — upah sejam = 1/173 × upah
//       sebulan; jam pertama tiap hari 1,5×, jam berikutnya 2×.
//       Upah sebulan = gaji bulanan (atau gaji harian × 25 untuk 6 hari kerja
//       / × 21 untuk 5 hari kerja) + tunjangan tetap.
//
// PENYEDERHANAAN (lihat README): lembur di hari istirahat / libur resmi tetap
// dihitung dengan kelipatan hari kerja (aturan resminya 2×/3×/4×), dan
// aturan "upah pokok minimal 75% dari upah" tidak diterapkan.

export type OvertimeRules = {
  minMinutes: number;
  roundingMinutes: number;
  maxHoursPerDay: number;
};

export type OvertimeRateMode = "flat" | "pp35";

export const DEFAULT_OVERTIME_RULES: OvertimeRules = {
  minMinutes: 30,
  roundingMinutes: 30,
  maxHoursPerDay: 4,
};

export function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

/** Durasi shift dalam menit; shift lewat tengah malam (mis. 22:00–06:00) ditangani. */
export function shiftDurationMinutes(shiftStart: string, shiftEnd: string) {
  const start = timeToMinutes(shiftStart);
  const end = timeToMinutes(shiftEnd);
  return end > start ? end - start : end + 24 * 60 - start;
}

/**
 * Jam lembur satu hari kerja, sudah menerapkan aturan minimum, pembulatan,
 * dan batas maksimal.
 *
 * @param checkInAt / checkOutAt  waktu absen (ISO / Date)
 * @param checkOutMinutesFromShiftDay  menit absen pulang dihitung dari tengah
 *   malam TANGGAL SHIFT (tambah 1440 kalau pulangnya sudah lewat tengah malam)
 */
export function computeOvertimeHours(input: {
  checkInAt: Date;
  checkOutAt: Date;
  checkOutMinutesFromShiftDay: number;
  shiftStart: string;
  shiftEnd: string;
  rules: OvertimeRules;
}): { rawMinutes: number; hours: number } {
  const start = timeToMinutes(input.shiftStart);
  const end = timeToMinutes(input.shiftEnd);
  // Jam pulang jadwal dalam menit dari tengah malam tanggal shift.
  const scheduledEnd = end > start ? end : end + 24 * 60;

  const afterEnd = input.checkOutMinutesFromShiftDay - scheduledEnd;
  const worked = (input.checkOutAt.getTime() - input.checkInAt.getTime()) / 60000;
  const beyondShift = worked - shiftDurationMinutes(input.shiftStart, input.shiftEnd);
  const rawMinutes = Math.max(0, Math.floor(Math.min(afterEnd, beyondShift)));

  return { rawMinutes, hours: applyOvertimeRules(rawMinutes, input.rules) };
}

export function applyOvertimeRules(rawMinutes: number, rules: OvertimeRules) {
  if (rawMinutes < rules.minMinutes) return 0;
  const step = Math.max(1, rules.roundingMinutes);
  const rounded = Math.floor(rawMinutes / step) * step;
  const capped = Math.min(rounded, rules.maxHoursPerDay * 60);
  return Math.round((capped / 60) * 100) / 100;
}

/** Upah sejam lembur menurut PP 35/2021 (1/173 × upah sebulan). */
export function pp35HourlyBase(input: {
  salaryType: "harian" | "bulanan";
  dailyRate: number;
  monthlyRate: number;
  recurringAllowanceTotal: number;
  workDaysPerWeek: 5 | 6;
}) {
  const monthlyWage =
    (input.salaryType === "bulanan"
      ? input.monthlyRate
      : input.dailyRate * (input.workDaysPerWeek === 5 ? 21 : 25)) + input.recurringAllowanceTotal;
  return monthlyWage / 173;
}

/** Upah lembur PP 35 hari kerja untuk satu hari: jam pertama 1,5×, berikutnya 2×. */
export function pp35DayMultiplierHours(hours: number) {
  return Math.min(hours, 1) * 1.5 + Math.max(hours - 1, 0) * 2;
}

/**
 * Upah lembur satu periode slip.
 * @param hoursPerDay      jam lembur per hari dari absensi (untuk mode pp35)
 * @param totalHours       total jam yang dibayar (bisa koreksi manual admin)
 */
export function overtimePay(input: {
  mode: OvertimeRateMode;
  hoursPerDay: number[];
  totalHours: number;
  flatRatePerHour: number;
  pp35HourlyBase: number;
}): { amount: number; ratePerHour: number } {
  if (input.mode === "flat") {
    return {
      amount: Math.round(input.totalHours * input.flatRatePerHour),
      ratePerHour: input.flatRatePerHour,
    };
  }

  const recordedHours = input.hoursPerDay.reduce((s, h) => s + h, 0);
  const recordedWeighted = input.hoursPerDay.reduce((s, h) => s + pp35DayMultiplierHours(h), 0);
  // Total sama dengan absensi → hitung per hari. Kalau admin mengoreksi
  // total jamnya, pakai rata-rata kelipatan dari absensi (atau 1,5× kalau
  // tidak ada data per hari) karena pembagian per harinya tidak diketahui.
  const weightedHours =
    Math.abs(input.totalHours - recordedHours) < 0.001
      ? recordedWeighted
      : input.totalHours * (recordedHours > 0 ? recordedWeighted / recordedHours : 1.5);

  return {
    amount: Math.round(weightedHours * input.pp35HourlyBase),
    ratePerHour: Math.round(input.pp35HourlyBase),
  };
}

export const BUSINESS_OVERTIME_COLUMNS = "overtime_rate_mode, work_days_per_week";

/** Upah lembur satu slip dari konfigurasi bisnis + data karyawan. */
export function overtimePayForPayslip(input: {
  business: { overtime_rate_mode: string; work_days_per_week: number } | null;
  employee: { salaryType: "harian" | "bulanan"; dailyRate: number; monthlyRate: number; flatRatePerHour: number };
  recurringAllowanceTotal: number;
  hoursPerDay: number[];
  totalHours: number;
}) {
  const mode: OvertimeRateMode = input.business?.overtime_rate_mode === "pp35" ? "pp35" : "flat";
  return overtimePay({
    mode,
    hoursPerDay: input.hoursPerDay,
    totalHours: input.totalHours,
    flatRatePerHour: input.employee.flatRatePerHour,
    pp35HourlyBase: pp35HourlyBase({
      salaryType: input.employee.salaryType,
      dailyRate: input.employee.dailyRate,
      monthlyRate: input.employee.monthlyRate,
      recurringAllowanceTotal: input.recurringAllowanceTotal,
      workDaysPerWeek: input.business?.work_days_per_week === 5 ? 5 : 6,
    }),
  });
}
