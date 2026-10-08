// Potongan wajib (BPJS & PPh 21) satu slip — dipakai di rekap payroll
// (pratinjau) dan saat slip dibuat, supaya keduanya selalu pakai rumus yang
// sama. Pure function, tidak menyentuh database.
import type { PayslipCalcResult } from "./calc";
import { bpjsWageBase, calculateBpjs, emptyBpjs, type BpjsMembership, type BpjsResult, type BpjsSettings } from "./bpjs";
import { calculatePph21, type PtkpStatus, type TerCategory } from "./pph21";

export type StatutoryInput = {
  result: PayslipCalcResult;
  recurringAllowanceTotal: number;
  bpjs: {
    enabled: boolean;
    settings: BpjsSettings;
    membership: BpjsMembership;
    wageOverride: number | null;
  };
  pph21: { enabled: boolean; ptkpStatus: PtkpStatus };
};

export type StatutoryResult = {
  bpjs: BpjsResult;
  pph21: { amount: number; category: TerCategory } | null;
};

export function calcStatutory(input: StatutoryInput): StatutoryResult {
  const { result, recurringAllowanceTotal } = input;

  const bpjs = input.bpjs.enabled
    ? calculateBpjs(
        bpjsWageBase(input.bpjs.wageOverride, result.basePay, recurringAllowanceTotal),
        input.bpjs.membership,
        input.bpjs.settings,
      )
    : emptyBpjs();

  // PPh 21 dihitung dari penghasilan bruto bulan ini: komponen gaji +
  // tunjangan tetap aktif + premi BPJS yang dibayar perusahaan tapi dihitung
  // sebagai penghasilan (Kesehatan, JKK, JKM), dikurangi potongan izin/telat.
  // Kasbon & pinjaman pribadi TIDAK mengurangi (pelunasan utang, bukan
  // pengurang penghasilan). Lihat src/lib/payroll/pph21.ts untuk disclaimer.
  let pph21: StatutoryResult["pph21"] = null;
  if (input.pph21.enabled) {
    const grossForTax = Math.max(
      0,
      result.basePay +
        result.mealAllowance +
        result.attendanceAllowance +
        result.lemburAmount +
        result.thrAmount +
        recurringAllowanceTotal +
        bpjs.taxableEmployerBenefit -
        result.izinDeduction -
        result.lateDeduction,
    );
    pph21 = calculatePph21(grossForTax, input.pph21.ptkpStatus);
  }

  return { bpjs, pph21 };
}

export const BUSINESS_STATUTORY_COLUMNS =
  "pph21_enabled, bpjs_enabled, bpjs_jkk_rate, bpjs_jp_wage_cap, bpjs_kesehatan_wage_cap";
export const EMPLOYEE_STATUTORY_COLUMNS =
  "ptkp_status, bpjs_kesehatan, bpjs_ketenagakerjaan, bpjs_wage_base";

export function statutoryConfig(
  business: {
    pph21_enabled: boolean;
    bpjs_enabled: boolean;
    bpjs_jkk_rate: number;
    bpjs_jp_wage_cap: number;
    bpjs_kesehatan_wage_cap: number;
  } | null,
  employee: {
    ptkp_status: string;
    bpjs_kesehatan: boolean;
    bpjs_ketenagakerjaan: boolean;
    bpjs_wage_base: number | null;
  },
): Omit<StatutoryInput, "result" | "recurringAllowanceTotal"> {
  return {
    bpjs: {
      enabled: business?.bpjs_enabled ?? false,
      settings: {
        jkkRatePercent: Number(business?.bpjs_jkk_rate ?? 0.24),
        jpWageCap: Number(business?.bpjs_jp_wage_cap ?? 0),
        kesehatanWageCap: Number(business?.bpjs_kesehatan_wage_cap ?? 0),
      },
      membership: {
        kesehatan: employee.bpjs_kesehatan,
        ketenagakerjaan: employee.bpjs_ketenagakerjaan,
      },
      wageOverride: employee.bpjs_wage_base === null ? null : Number(employee.bpjs_wage_base),
    },
    pph21: {
      enabled: business?.pph21_enabled ?? false,
      ptkpStatus: employee.ptkp_status as PtkpStatus,
    },
  };
}
