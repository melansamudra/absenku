// Formula total akhir SATU slip gaji yang SUDAH TERSIMPAN di database —
// dipakai di halaman detail slip dan validasi sebelum "Tandai Lunas". Beda
// dengan calcPayslip() (lib/payroll/calc.ts) yang menghitung komponen dari
// nol saat slip BELUM dibuat; fungsi ini murni menjumlahkan kolom yang sudah
// ada di baris `payslips` + adjustments-nya. Kedua tempat pemakaian formula
// ini WAJIB tetap sinkron.

export type PayslipTotalInput = {
  base_pay: number;
  meal_allowance: number;
  attendance_allowance: number;
  lembur_amount: number;
  thr_amount: number;
  izin_deduction: number;
  late_deduction: number;
  kasbon_deduction: number;
  personal_loan_deduction: number;
  pph21_amount: number;
  bpjs_employee_amount: number;
};

export type PayslipAdjustment = {
  type: "tunjangan" | "potongan";
  amount: number;
};

export function payslipTotal(payslip: PayslipTotalInput, adjustments: PayslipAdjustment[]) {
  const adjustmentTotal = adjustments.reduce(
    (sum, a) => sum + (a.type === "tunjangan" ? a.amount : -a.amount),
    0,
  );

  return (
    payslip.base_pay +
    payslip.meal_allowance +
    payslip.attendance_allowance +
    payslip.lembur_amount +
    payslip.thr_amount +
    adjustmentTotal -
    payslip.izin_deduction -
    payslip.late_deduction -
    payslip.kasbon_deduction -
    payslip.personal_loan_deduction -
    payslip.pph21_amount -
    payslip.bpjs_employee_amount
  );
}
