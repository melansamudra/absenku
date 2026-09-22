import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Sisa kasbon dihitung, bukan disimpan sebagai kolom "settled":
//   SUM(employee_advances.amount)
//   − SUM(payslips.kasbon_deduction) dari payslip employee itu yang paid_at
//     is not null
// supaya potongan di slip yang masih bisa diedit/dihapus belum dianggap lunas.
export async function getOutstandingKasbon(
  supabase: SupabaseServerClient,
  businessId: string,
  employeeId: string,
) {
  const [{ data: advances }, { data: paidSlips }] = await Promise.all([
    supabase
      .from("employee_advances")
      .select("amount")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId),
    supabase
      .from("payslips")
      .select("kasbon_deduction")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .not("paid_at", "is", null),
  ]);

  const given = (advances ?? []).reduce((sum, a) => sum + Number(a.amount), 0);
  const deducted = (paidSlips ?? []).reduce((sum, p) => sum + Number(p.kasbon_deduction), 0);
  return Math.max(0, given - deducted);
}
