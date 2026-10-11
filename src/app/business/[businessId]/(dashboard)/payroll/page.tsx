import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { Card, PageHeader, btnOutline, btnPrimary } from "@/components/form-ui";
import GenerateButton from "./generate-button";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

function currentMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}

function lastDay(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10);
}

function monthLabel(month: string) {
  const [y, m] = month.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}

const MONTH_NAMES = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
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
  const year = Number(month.slice(0, 4));
  const base = `/business/${businessId}/payroll`;
  const supabase = await createClient();

  const { data: payslips } = await supabase
    .from("payslips")
    .select(
      "id, period_start, period_end, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount, paid_at, employee_id, employees(name, employee_code), payslip_adjustments(type, amount)",
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

  const thisMonth = currentMonth();

  return (
    <div>
      <PageHeader
        title="Payroll"
        subtitle={`${rows.length} slip · ${unpaid.length} belum dibayar`}
        actions={
          <>
            <Link href={`${base}/laporan?month=${month}`} className={btnOutline}>
              Laporan Gaji
            </Link>
            <Link href={`${base}/kasbon`} className={btnOutline}>
              Kasbon
            </Link>
            <Link href={`${base}/pinjaman`} className={btnOutline}>
              Pinjaman Pribadi
            </Link>
            <GenerateButton businessId={businessId} month={month} label={monthLabel(month)} />
            <Link href={`${base}/rekap`} className={btnPrimary}>
              + Buat Slip Gaji
            </Link>
          </>
        }
      />

      <Card className="mb-4 !p-3">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Link href={`${base}?month=${year - 1}-${month.slice(5)}`} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50" aria-label="Tahun sebelumnya">
              ←
            </Link>
            <span className="min-w-14 text-center text-[13px] font-semibold text-zinc-800">{year}</span>
            <Link href={`${base}?month=${year + 1}-${month.slice(5)}`} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs hover:bg-zinc-50" aria-label="Tahun berikutnya">
              →
            </Link>
          </div>
          {month !== thisMonth && (
            <Link href={base} className="text-xs font-semibold text-brand-700 hover:underline">
              Bulan Ini
            </Link>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MONTH_NAMES.map((name, i) => {
            const ym = `${year}-${String(i + 1).padStart(2, "0")}`;
            const active = ym === month;
            return (
              <Link
                key={ym}
                href={`${base}?month=${ym}`}
                className={`flex w-24 shrink-0 flex-col items-center rounded-xl py-2 text-center transition-colors ${
                  active ? "bg-brand-600 text-white" : ym === thisMonth ? "bg-brand-100 text-brand-800" : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                <span className="text-[13px] font-semibold">{name}</span>
                <span className="text-[10px] opacity-75">{year}</span>
              </Link>
            );
          })}
        </div>
      </Card>

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

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Karyawan</th>
                <th className="px-3 py-3">Periode</th>
                <th className="px-3 py-3 text-right">Total Gaji Bersih</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-14 text-center text-sm text-zinc-400">
                    Belum ada slip gaji di {monthLabel(month)}. Klik <b>Generate Payroll</b> untuk membuat slip semua karyawan sekaligus.
                  </td>
                </tr>
              )}
              {rows.map(({ p, total }, i) => {
                const emp = p.employees as unknown as { name: string; employee_code: string | null } | null;
                return (
                  <tr key={p.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <Link href={`${base}/${p.id}`} className="font-medium text-brand-700 hover:underline">
                        {emp?.name ?? "—"}
                      </Link>
                      <p className="text-xs text-zinc-400">{emp?.employee_code ?? ""}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">
                      {fmtDate(p.period_start)} – {fmtDate(p.period_end)}
                    </td>
                    <td className="px-3 py-3 text-right font-semibold text-zinc-900">{fmtRupiah(total)}</td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          p.paid_at ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.paid_at ? "Sudah Bayar" : "Siap Bayar"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
