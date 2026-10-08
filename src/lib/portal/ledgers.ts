import type { createServiceClient } from "@/lib/supabase/service";

// Ringkasan kasbon & pinjaman pribadi satu karyawan untuk Portal Karyawan.
// Rumus sisa SAMA dengan lib/payroll/kasbon.ts & personal-loan.ts (dipakai di
// dashboard admin): total pemberian − potongan di slip yang SUDAH dibayar.
// Potongan di slip yang belum dibayar ditampilkan terpisah sebagai "akan
// dipotong", karena slip itu masih bisa diubah admin.

type ServiceClient = ReturnType<typeof createServiceClient>;

export type LedgerEntry = {
  date: string;
  label: string;
  amount: number;
  kind: "pemberian" | "potongan" | "akan_dipotong";
};

export type LedgerSummary = {
  outstanding: number;
  pendingDeduction: number;
  entries: LedgerEntry[];
};

function summarize(
  given: { date: string; amount: number; note: string | null }[],
  slips: { period_start: string; period_end: string; paid_at: string | null; deduction: number }[],
  givenLabel: string,
): LedgerSummary {
  const entries: LedgerEntry[] = [
    ...given.map((g) => ({
      date: g.date,
      label: g.note ? `${givenLabel} · ${g.note}` : givenLabel,
      amount: Number(g.amount),
      kind: "pemberian" as const,
    })),
    ...slips
      .filter((s) => Number(s.deduction) > 0)
      .map((s) => ({
        date: s.period_end,
        label: `Potong gaji ${s.period_start} — ${s.period_end}`,
        amount: Number(s.deduction),
        kind: s.paid_at ? ("potongan" as const) : ("akan_dipotong" as const),
      })),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const totalGiven = given.reduce((sum, g) => sum + Number(g.amount), 0);
  const deducted = slips
    .filter((s) => s.paid_at)
    .reduce((sum, s) => sum + Number(s.deduction), 0);
  const pendingDeduction = slips
    .filter((s) => !s.paid_at)
    .reduce((sum, s) => sum + Number(s.deduction), 0);

  return { outstanding: Math.max(0, totalGiven - deducted), pendingDeduction, entries };
}

export async function loadEmployeeLedgers(
  supabase: ServiceClient,
  businessId: string,
  employeeId: string,
): Promise<{ kasbon: LedgerSummary; personalLoan: LedgerSummary }> {
  const [{ data: advances }, { data: loans }, { data: slips }] = await Promise.all([
    supabase
      .from("employee_advances")
      .select("date, amount, note")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId),
    supabase
      .from("employee_personal_loans")
      .select("date, amount, note")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId),
    supabase
      .from("payslips")
      .select("period_start, period_end, paid_at, kasbon_deduction, personal_loan_deduction")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId),
  ]);

  return {
    kasbon: summarize(
      advances ?? [],
      (slips ?? []).map((s) => ({ ...s, deduction: s.kasbon_deduction })),
      "Kasbon",
    ),
    personalLoan: summarize(
      loans ?? [],
      (slips ?? []).map((s) => ({ ...s, deduction: s.personal_loan_deduction })),
      "Pinjaman",
    ),
  };
}
