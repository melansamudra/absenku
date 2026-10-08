import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { payslipTotal } from "@/lib/payroll/payslip-total";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default async function PayrollPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: payslips } = await supabase
    .from("payslips")
    .select(
      "id, period_start, period_end, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount, paid_at, employee_id, employees(name)",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(50);

  const unpaidCount = (payslips ?? []).filter((p) => !p.paid_at).length;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Payroll</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {payslips?.length ?? 0} slip · {unpaidCount} belum dibayar
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/business/${businessId}/payroll/kasbon`}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Kasbon
          </Link>
          <Link
            href={`/business/${businessId}/payroll/pinjaman`}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Pinjaman Pribadi
          </Link>
          <Link
            href={`/business/${businessId}/payroll/rekap`}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Buat Slip Gaji
          </Link>
        </div>
      </div>

      {!payslips || payslips.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada slip gaji.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {payslips.map((p) => {
              const employeeName =
                (p.employees as unknown as { name: string } | null)?.name ?? "—";
              const total = payslipTotal(p, []);
              return (
                <Link
                  key={p.id}
                  href={`/business/${businessId}/payroll/${p.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50"
                >
                  <div>
                    <p className="font-semibold text-zinc-900">{employeeName}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {p.period_start} — {p.period_end}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">{fmtRupiah(total)}</p>
                    <span
                      className={`text-[11px] font-semibold ${
                        p.paid_at ? "text-emerald-600" : "text-amber-600"
                      }`}
                    >
                      {p.paid_at ? "Lunas" : "Belum dibayar"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
