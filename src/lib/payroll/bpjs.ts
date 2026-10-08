// Iuran BPJS Kesehatan & Ketenagakerjaan per slip gaji — pure function, tidak
// menyentuh database. Dipakai di rekap payroll (pratinjau) dan saat slip dibuat.
//
// Tarif (PP 44/2015 & perubahannya, PP 45/2015, Perpres 82/2018 & perubahannya):
//   BPJS Kesehatan  4% perusahaan + 1% karyawan, upah dibatasi atas (default Rp12 jt)
//   JHT             3,7% perusahaan + 2% karyawan, tanpa batas upah
//   JP              2% perusahaan + 1% karyawan, upah dibatasi atas (disesuaikan
//                   BPJS tiap Maret — nilainya disimpan per bisnis, bukan di sini)
//   JKK             0,24%–1,74% perusahaan, sesuai tingkat risiko lingkungan kerja
//   JKM             0,3% perusahaan
//
// PENYEDERHANAAN yang disengaja (lihat README):
//   - Batas BAWAH upah (UMK) tidak diterapkan otomatis — isi "Upah Dasar BPJS"
//     di data karyawan kalau gaji di bawah UMK tapi didaftarkan sesuai UMK.
//   - Anggota keluarga tambahan BPJS Kesehatan (1% per orang) tidak dihitung.
//   - JKP (Jaminan Kehilangan Pekerjaan) dibayar pemerintah, tidak dihitung.

export type BpjsSettings = {
  jkkRatePercent: number;
  jpWageCap: number;
  kesehatanWageCap: number;
};

export type BpjsMembership = {
  kesehatan: boolean;
  ketenagakerjaan: boolean;
};

export type BpjsResult = {
  wageBase: number;
  employee: { kesehatan: number; jht: number; jp: number; total: number };
  employer: { kesehatan: number; jht: number; jp: number; jkk: number; jkm: number; total: number };
  /**
   * Premi yang dibayar perusahaan tapi menurut aturan PPh 21 ikut jadi
   * penghasilan bruto karyawan (BPJS Kesehatan bagian perusahaan, JKK, JKM).
   * JHT & JP bagian perusahaan TIDAK termasuk.
   */
  taxableEmployerBenefit: number;
};

export const JKK_RATE_OPTIONS = [
  { value: 0.24, label: "0,24% — risiko sangat rendah (kantor, toko, F&B umumnya)" },
  { value: 0.54, label: "0,54% — risiko rendah" },
  { value: 0.89, label: "0,89% — risiko sedang" },
  { value: 1.27, label: "1,27% — risiko tinggi" },
  { value: 1.74, label: "1,74% — risiko sangat tinggi" },
];

const pct = (amount: number, percent: number) => Math.round((amount * percent) / 100);

export function emptyBpjs(): BpjsResult {
  return {
    wageBase: 0,
    employee: { kesehatan: 0, jht: 0, jp: 0, total: 0 },
    employer: { kesehatan: 0, jht: 0, jp: 0, jkk: 0, jkm: 0, total: 0 },
    taxableEmployerBenefit: 0,
  };
}

export function calculateBpjs(
  wageBase: number,
  membership: BpjsMembership,
  settings: BpjsSettings,
): BpjsResult {
  const result = emptyBpjs();
  const wage = Math.max(0, Math.round(wageBase));
  result.wageBase = wage;
  if (wage === 0) return result;

  if (membership.kesehatan) {
    const kesWage = Math.min(wage, settings.kesehatanWageCap);
    result.employee.kesehatan = pct(kesWage, 1);
    result.employer.kesehatan = pct(kesWage, 4);
  }

  if (membership.ketenagakerjaan) {
    const jpWage = Math.min(wage, settings.jpWageCap);
    result.employee.jht = pct(wage, 2);
    result.employer.jht = pct(wage, 3.7);
    result.employee.jp = pct(jpWage, 1);
    result.employer.jp = pct(jpWage, 2);
    result.employer.jkk = pct(wage, settings.jkkRatePercent);
    result.employer.jkm = pct(wage, 0.3);
  }

  result.employee.total = result.employee.kesehatan + result.employee.jht + result.employee.jp;
  result.employer.total =
    result.employer.kesehatan +
    result.employer.jht +
    result.employer.jp +
    result.employer.jkk +
    result.employer.jkm;
  result.taxableEmployerBenefit =
    result.employer.kesehatan + result.employer.jkk + result.employer.jkm;

  return result;
}

/**
 * Upah dasar BPJS: nilai override per karyawan kalau diisi, kalau tidak
 * gaji pokok slip periode ini + tunjangan tetap (definisi "upah" untuk iuran).
 */
export function bpjsWageBase(override: number | null, basePay: number, recurringAllowanceTotal: number) {
  return override !== null && override > 0 ? override : basePay + recurringAllowanceTotal;
}
