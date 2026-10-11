import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { payslipTotal } from "@/lib/payroll/payslip-total";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

function currentMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}

function addMonths(month: string, delta: number) {
  const [y, m] = month.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

function lastDay(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}

export default async function PayrollPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ month?: string }>;
}) {
  const { businessId } = await params;
  const { month: m } = await searchParams;
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : currentMonth();
  const base = `/business/${businessId}/payroll`;
  const supabase = await createClient();

  const { data: payslips } = await supabase
    .from("payslips")
    .select(
      "id, period_start, period_end, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount, paid_at, employee_id, employees(name), payslip_adjustments(type, amount)",
    )
    .eq("business_id", businessId)
    .gte("period_start", `${month}-01`)
    .lte("period_start", lastDay(month))
    .order("created_at", { ascending: false });

  // Total tiap slip sudah memperhitungkan tunjangan/potongan tambahan (mis. reimburse).
  const rows = (payslips ?? []).map((p) => ({
    p,
    total: payslipTotal(
      p,
      ((p.payslip_adjustments ?? []) as { type: "tunjangan" | "potongan"; amount: number }[]).map((a) => ({ type: a.type, amount: Number(a.amount) })),
    ),
  }));
  const unpaid = rows.filter((r) => !r.p.paid_at);
  const grandTotal = rows.reduce((t, r) => t + r.total, 0);
  const unpaidTotal = unpaid.reduce((t, r) => t + r.total, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Payroll</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {rows.length} slip · {unpaid.length} belum dibayar
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`${base}/laporan?month=${month}`} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Laporan Gaji
          </Link>
          <Link href={`${base}/kasbon`} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Kasbon
          </Link>
          <Link href={`${base}/pinjaman`} className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50">
            Pinjaman Pribadi
          </Link>
          <Link href={`${base}/rekap`} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
            + Buat Slip Gaji
          </Link>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between rounded-xl border border-zinc-100 bg-white px-4 py-2.5 shadow-sm">
        <Link href={`${base}?month=${addMonths(month, -1)}`} className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
          ← {monthLabel(addMonths(month, -1))}
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-zinc-900">{monthLabel(month)}</span>
          {month !== currentMonth() && (
            <Link href={base} className="text-xs text-brand-600 hover:underline">
              Bulan ini
            </Link>
          )}
        </div>
        <Link href={`${base}?month=${addMonths(month, 1)}`} className="text-sm font-semibold text-zinc-600 hover:text-zinc-900">
          {monthLabel(addMonths(month, 1))} →
        </Link>
      </div>

      {rows.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-brand-700">Total Gaji Bersih</p>
            <p className="mt-0.5 text-lg font-bold text-brand-700">{fmtRupiah(grandTotal)}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase text-amber-700">Belum Dibayar</p>
            <p className="mt-0.5 text-lg font-bold text-amber-700">{fmtRupiah(unpaidTotal)}</p>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada slip gaji di {monthLabel(month)}.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {rows.map(({ p, total }) => {
              const employeeName = (p.employees as unknown as { name: string } | null)?.name ?? "—";
              return (
                <Link key={p.id} href={`${base}/${p.id}`} className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50">
                  <div>
                    <p className="font-semibold text-zinc-900">{employeeName}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {p.period_start} — {p.period_end}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-zinc-900">{fmtRupiah(total)}</p>
                    <span className={`text-[11px] font-semibold ${p.paid_at ? "text-emerald-600" : "text-amber-600"}`}>{p.paid_at ? "Lunas" : "Belum dibayar"}</span>
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
