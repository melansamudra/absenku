import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Sisa pinjaman pribadi dihitung, bukan disimpan sebagai kolom "settled" —
// pola identik src/lib/payroll/kasbon.ts, tapi pinjaman pribadi adalah
// ledger terpisah (beda tujuan) dari kasbon (employee_advances) dan tidak
// pernah menyentuh alur apa pun selain payslips.personal_loan_deduction.
export async function getOutstandingPersonalLoan(
  supabase: SupabaseServerClient,
  businessId: string,
  employeeId: string,
) {
  const [{ data: loans }, { data: paidSlips }] = await Promise.all([
    supabase
      .from("employee_personal_loans")
      .select("amount")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId),
    supabase
      .from("payslips")
      .select("personal_loan_deduction")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .not("paid_at", "is", null),
  ]);

  const given = (loans ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  const deducted = (paidSlips ?? []).reduce(
    (sum, p) => sum + Number(p.personal_loan_deduction),
    0,
  );
  return Math.max(0, given - deducted);
}
