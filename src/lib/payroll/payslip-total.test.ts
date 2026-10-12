import { describe, expect, it } from "vitest";
import { payslipTotal } from "./payslip-total";
import { payslipRows } from "./payslip-rows";

const slip = {
  hadir_count: 24, sakit_count: 0, base_pay: 4_500_000, meal_allowance: 360_000, attendance_allowance: 240_000,
  lembur_hours: 7, lembur_amount: 312_139, thr_amount: 0, izin_unnoted_count: 0, izin_deduction: 0,
  late_count: 2, late_deduction: 35_000, kasbon_deduction: 100_000, personal_loan_deduction: 50_000,
  pph21_amount: 40_000, ter_category: "B", bpjs_employee_amount: 192_000,
  bpjs_detail: { employee: { kesehatan: 48_000, jht: 96_000, jp: 48_000 } },
};

describe("total slip", () => {
  it("penjumlahan sesuai rumus: pendapatan + tunjangan − potongan − kasbon − pinjaman − PPh21 − BPJS", () => {
    const adj = [{ type: "tunjangan" as const, amount: 300_000 }, { type: "potongan" as const, amount: 20_000 }];
    expect(payslipTotal(slip, adj)).toBe(4_500_000 + 360_000 + 240_000 + 312_139 + 300_000 - 20_000 - 35_000 - 100_000 - 50_000 - 40_000 - 192_000);
  });
  it("baris rincian slip selalu sinkron dengan total (tanpa penyesuaian)", () => {
    const sum = payslipRows(slip).reduce((t, r) => t + r.value, 0);
    expect(sum).toBe(payslipTotal(slip, []));
  });
});
