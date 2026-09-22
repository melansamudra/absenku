// Perhitungan PPh 21 pakai metode TER (Tarif Efektif Rata-rata) sesuai
// PP 58/2023 & PMK 168/PMK.03/2023, berlaku sejak masa pajak Januari 2024.
// Tarif efektif dikalikan LANGSUNG ke penghasilan bruto sebulan — PTKP
// karyawan cuma menentukan kategori tabel mana (A/B/C) yang dipakai, tidak
// dikurangkan lagi tiap bulan (sudah "dibakukan" ke dalam tarif per lapisan).
//
// SUMBER: tabel ditranskrip dari agregator pihak ketiga (bukan hasil parse
// dokumen resmi pajak.go.id secara langsung), per pengecekan 2026-09-20.
// PENYEDERHANAAN yang disengaja (lihat README untuk detail):
//   - Tidak ada rekonsiliasi/penghitungan ulang tahunan di masa pajak
//     Desember (yang menurut aturan resmi pakai tarif Pasal 17 progresif,
//     bukan TER) — semua bulan termasuk Desember dihitung pakai TER di sini.
//   - THR/bonus digabung dengan gaji bulan berjalan dan dikenai TER yang
//     sama, bukan dihitung terpisah dengan metode annualisasi seperti aturan
//     resmi.
//   - Bukan pengganti konsultasi akuntan/konsultan pajak — verifikasi dulu
//     sebelum dipakai untuk pelaporan/pembayaran pajak sungguhan.
export type PtkpStatus = "TK/0" | "TK/1" | "TK/2" | "TK/3" | "K/0" | "K/1" | "K/2" | "K/3";
export type TerCategory = "A" | "B" | "C";

const PTKP_TO_TER_CATEGORY: Record<PtkpStatus, TerCategory> = {
  "TK/0": "A",
  "TK/1": "A",
  "K/0": "A",
  "TK/2": "B",
  "TK/3": "B",
  "K/1": "B",
  "K/2": "B",
  "K/3": "C",
};

type TerBracket = { upTo: number; ratePercent: number };

// Setiap bracket: "upTo" adalah batas atas (inklusif) penghasilan bruto
// bulanan dalam Rupiah untuk tarif itu; bracket terakhir per kategori
// upTo=Infinity. Diurutkan menaik, dicari bracket pertama yang penghasilan
// brutonya <= upTo.
const TER_A: TerBracket[] = [
  { upTo: 5_400_000, ratePercent: 0 },
  { upTo: 5_650_000, ratePercent: 0.25 },
  { upTo: 5_950_000, ratePercent: 0.5 },
  { upTo: 6_300_000, ratePercent: 0.75 },
  { upTo: 6_750_000, ratePercent: 1 },
  { upTo: 7_500_000, ratePercent: 1.25 },
  { upTo: 8_550_000, ratePercent: 1.5 },
  { upTo: 9_650_000, ratePercent: 1.75 },
  { upTo: 10_050_000, ratePercent: 2 },
  { upTo: 10_350_000, ratePercent: 2.25 },
  { upTo: 10_700_000, ratePercent: 2.5 },
  { upTo: 11_050_000, ratePercent: 3 },
  { upTo: 11_600_000, ratePercent: 3.5 },
  { upTo: 12_500_000, ratePercent: 4 },
  { upTo: 13_750_000, ratePercent: 5 },
  { upTo: 15_100_000, ratePercent: 6 },
  { upTo: 16_950_000, ratePercent: 7 },
  { upTo: 19_750_000, ratePercent: 8 },
  { upTo: 24_150_000, ratePercent: 9 },
  { upTo: 26_450_000, ratePercent: 10 },
  { upTo: 28_000_000, ratePercent: 11 },
  { upTo: 30_050_000, ratePercent: 12 },
  { upTo: 32_400_000, ratePercent: 13 },
  { upTo: 35_400_000, ratePercent: 14 },
  { upTo: 39_100_000, ratePercent: 15 },
  { upTo: 43_850_000, ratePercent: 16 },
  { upTo: 47_800_000, ratePercent: 17 },
  { upTo: 51_400_000, ratePercent: 18 },
  { upTo: 56_300_000, ratePercent: 19 },
  { upTo: 62_200_000, ratePercent: 20 },
  { upTo: 68_600_000, ratePercent: 21 },
  { upTo: 77_500_000, ratePercent: 22 },
  { upTo: 89_000_000, ratePercent: 23 },
  { upTo: 103_000_000, ratePercent: 24 },
  { upTo: 125_000_000, ratePercent: 25 },
  { upTo: 157_000_000, ratePercent: 26 },
  { upTo: 206_000_000, ratePercent: 27 },
  { upTo: 337_000_000, ratePercent: 28 },
  { upTo: 454_000_000, ratePercent: 29 },
  { upTo: 550_000_000, ratePercent: 30 },
  { upTo: 695_000_000, ratePercent: 31 },
  { upTo: 910_000_000, ratePercent: 32 },
  { upTo: 1_400_000_000, ratePercent: 33 },
  { upTo: Infinity, ratePercent: 34 },
];

const TER_B: TerBracket[] = [
  { upTo: 6_200_000, ratePercent: 0 },
  { upTo: 6_500_000, ratePercent: 0.25 },
  { upTo: 6_850_000, ratePercent: 0.5 },
  { upTo: 7_300_000, ratePercent: 0.75 },
  { upTo: 9_200_000, ratePercent: 1 },
  { upTo: 10_750_000, ratePercent: 1.5 },
  { upTo: 11_250_000, ratePercent: 2 },
  { upTo: 11_600_000, ratePercent: 2.5 },
  { upTo: 12_600_000, ratePercent: 3 },
  { upTo: 13_600_000, ratePercent: 4 },
  { upTo: 14_950_000, ratePercent: 5 },
  { upTo: 16_400_000, ratePercent: 6 },
  { upTo: 18_450_000, ratePercent: 7 },
  { upTo: 21_850_000, ratePercent: 8 },
  { upTo: 26_000_000, ratePercent: 9 },
  { upTo: 27_700_000, ratePercent: 10 },
  { upTo: 29_350_000, ratePercent: 11 },
  { upTo: 31_450_000, ratePercent: 12 },
  { upTo: 33_950_000, ratePercent: 13 },
  { upTo: 37_100_000, ratePercent: 14 },
  { upTo: 41_100_000, ratePercent: 15 },
  { upTo: 45_800_000, ratePercent: 16 },
  { upTo: 49_500_000, ratePercent: 17 },
  { upTo: 53_800_000, ratePercent: 18 },
  { upTo: 58_500_000, ratePercent: 19 },
  { upTo: 64_000_000, ratePercent: 20 },
  { upTo: 71_000_000, ratePercent: 21 },
  { upTo: 80_000_000, ratePercent: 22 },
  { upTo: 93_000_000, ratePercent: 23 },
  { upTo: 109_000_000, ratePercent: 24 },
  { upTo: 129_000_000, ratePercent: 25 },
  { upTo: 163_000_000, ratePercent: 26 },
  { upTo: 211_000_000, ratePercent: 27 },
  { upTo: 374_000_000, ratePercent: 28 },
  { upTo: 459_000_000, ratePercent: 29 },
  { upTo: 555_000_000, ratePercent: 30 },
  { upTo: 704_000_000, ratePercent: 31 },
  { upTo: 957_000_000, ratePercent: 32 },
  { upTo: 1_405_000_000, ratePercent: 33 },
  { upTo: Infinity, ratePercent: 34 },
];

const TER_C: TerBracket[] = [
  { upTo: 6_600_000, ratePercent: 0 },
  { upTo: 6_950_000, ratePercent: 0.25 },
  { upTo: 7_350_000, ratePercent: 0.5 },
  { upTo: 7_800_000, ratePercent: 0.75 },
  { upTo: 8_850_000, ratePercent: 1 },
  { upTo: 9_800_000, ratePercent: 1.25 },
  { upTo: 10_950_000, ratePercent: 1.5 },
  { upTo: 11_200_000, ratePercent: 1.75 },
  { upTo: 12_050_000, ratePercent: 2 },
  { upTo: 12_950_000, ratePercent: 3 },
  { upTo: 14_150_000, ratePercent: 4 },
  { upTo: 15_550_000, ratePercent: 5 },
  { upTo: 17_050_000, ratePercent: 6 },
  { upTo: 19_500_000, ratePercent: 7 },
  { upTo: 22_700_000, ratePercent: 8 },
  { upTo: 26_600_000, ratePercent: 9 },
  { upTo: 28_100_000, ratePercent: 10 },
  { upTo: 30_100_000, ratePercent: 11 },
  { upTo: 32_600_000, ratePercent: 12 },
  { upTo: 35_400_000, ratePercent: 13 },
  { upTo: 38_900_000, ratePercent: 14 },
  { upTo: 43_000_000, ratePercent: 15 },
  { upTo: 47_400_000, ratePercent: 16 },
  { upTo: 51_200_000, ratePercent: 17 },
  { upTo: 55_800_000, ratePercent: 18 },
  { upTo: 60_400_000, ratePercent: 19 },
  { upTo: 66_700_000, ratePercent: 20 },
  { upTo: 74_500_000, ratePercent: 21 },
  { upTo: 83_200_000, ratePercent: 22 },
  { upTo: 95_600_000, ratePercent: 23 },
  { upTo: 110_000_000, ratePercent: 24 },
  { upTo: 134_000_000, ratePercent: 25 },
  { upTo: 169_000_000, ratePercent: 26 },
  { upTo: 221_000_000, ratePercent: 27 },
  { upTo: 390_000_000, ratePercent: 28 },
  { upTo: 463_000_000, ratePercent: 29 },
  { upTo: 561_000_000, ratePercent: 30 },
  { upTo: 709_000_000, ratePercent: 31 },
  { upTo: 965_000_000, ratePercent: 32 },
  { upTo: 1_419_000_000, ratePercent: 33 },
  { upTo: Infinity, ratePercent: 34 },
];

const TER_TABLES: Record<TerCategory, TerBracket[]> = { A: TER_A, B: TER_B, C: TER_C };

export function terCategoryForPtkp(ptkpStatus: PtkpStatus): TerCategory {
  return PTKP_TO_TER_CATEGORY[ptkpStatus];
}

export function calculatePph21(grossMonthlyIncome: number, ptkpStatus: PtkpStatus) {
  const category = terCategoryForPtkp(ptkpStatus);
  const gross = Math.max(0, grossMonthlyIncome);
  const bracket = TER_TABLES[category].find((b) => gross <= b.upTo)!;
  const amount = Math.round((gross * bracket.ratePercent) / 100);

  return { category, ratePercent: bracket.ratePercent, amount };
}
