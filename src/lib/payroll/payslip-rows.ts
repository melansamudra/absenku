// Baris rincian satu slip gaji yang sudah tersimpan — dipakai di halaman
// detail slip admin, layout cetak, dan Portal Karyawan, supaya ketiganya
// selalu menampilkan komponen yang sama (dan sinkron dengan payslipTotal()).

export type PayslipRowsInput = {
  hadir_count: number;
  sakit_count: number;
  base_pay: number;
  meal_allowance: number;
  attendance_allowance: number;
  lembur_hours: number;
  lembur_amount: number;
  thr_amount: number;
  izin_unnoted_count: number;
  izin_deduction: number;
  late_count: number;
  late_deduction: number;
  kasbon_deduction: number;
  personal_loan_deduction: number;
  pph21_amount: number;
  ter_category: string | null;
  bpjs_employee_amount: number;
  bpjs_detail: unknown;
};

export type PayslipRow = { label: string; value: number };

type BpjsDetail = {
  employee?: { kesehatan?: number; jht?: number; jp?: number };
  employer?: { kesehatan?: number; jht?: number; jp?: number; jkk?: number; jkm?: number; total?: number };
};

export function payslipRows(p: PayslipRowsInput): PayslipRow[] {
  const bpjs = (p.bpjs_detail ?? null) as BpjsDetail | null;
  const bpjsRows: PayslipRow[] =
    p.bpjs_employee_amount > 0
      ? bpjs?.employee
        ? [
            { label: "Potongan BPJS Kesehatan (1%)", value: -(bpjs.employee.kesehatan ?? 0) },
            { label: "Potongan BPJS JHT (2%)", value: -(bpjs.employee.jht ?? 0) },
            { label: "Potongan BPJS JP (1%)", value: -(bpjs.employee.jp ?? 0) },
          ].filter((r) => r.value !== 0)
        : [{ label: "Potongan BPJS", value: -p.bpjs_employee_amount }]
      : [];

  return [
    { label: `Gaji Pokok (${p.hadir_count} hadir, ${p.sakit_count} sakit)`, value: p.base_pay },
    { label: "Uang Makan", value: p.meal_allowance },
    { label: "Tunjangan Hadir", value: p.attendance_allowance },
    { label: `Lembur (${p.lembur_hours} jam)`, value: p.lembur_amount },
    { label: "THR", value: p.thr_amount },
    { label: `Potongan Izin (${p.izin_unnoted_count}x tanpa keterangan)`, value: -p.izin_deduction },
    { label: `Potongan Telat (${p.late_count}x)`, value: -p.late_deduction },
    { label: "Potongan Kasbon", value: -p.kasbon_deduction },
    { label: "Potongan Pinjaman Pribadi", value: -p.personal_loan_deduction },
    ...bpjsRows,
    ...(p.pph21_amount > 0
      ? [
          {
            label: `Potongan PPh 21${p.ter_category ? ` (TER ${p.ter_category})` : ""}`,
            value: -p.pph21_amount,
          },
        ]
      : []),
  ];
}

/** Rincian iuran BPJS yang ditanggung perusahaan (informasi, tidak memotong gaji). */
export function bpjsEmployerRows(bpjsDetail: unknown): PayslipRow[] {
  const employer = (bpjsDetail as BpjsDetail | null)?.employer;
  if (!employer || !employer.total) return [];
  return [
    { label: "BPJS Kesehatan (4%)", value: employer.kesehatan ?? 0 },
    { label: "JHT (3,7%)", value: employer.jht ?? 0 },
    { label: "JP (2%)", value: employer.jp ?? 0 },
    { label: "JKK", value: employer.jkk ?? 0 },
    { label: "JKM (0,3%)", value: employer.jkm ?? 0 },
  ].filter((r) => r.value > 0);
}
