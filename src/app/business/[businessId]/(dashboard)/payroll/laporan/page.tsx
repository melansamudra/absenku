import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { payslipRows } from "@/lib/payroll/payslip-rows";
import PrintReportButton from "./print-button";
import CopyWhatsappButton from "./copy-whatsapp-button";

// Laporan untuk dikirim ke owner: HANYA karyawan yang slip-nya sudah dibuat
// (angka final) di bulan itu, lengkap dengan rekening tujuan transfer dan
// rincian per slip. Beda dengan Rekap Payroll yang masih berisi estimasi.

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

const rp = (v: number) => `Rp${Math.round(v).toLocaleString("id-ID")}`;

const SLIP_COLUMNS =
  "id, employee_id, period_start, period_end, hadir_count, sakit_count, base_pay, meal_allowance, attendance_allowance, lembur_hours, lembur_amount, thr_amount, izin_unnoted_count, izin_deduction, late_count, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, ter_category, bpjs_employee_amount, bpjs_employer_amount, bpjs_detail, paid_at, employees(name, bank_name, bank_account_number, bank_account_name), payslip_adjustments(type, label, amount)";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ businessId: string }>; searchParams: Promise<{ month?: string }> }): Promise<Metadata> {
  const { businessId } = await params;
  const { month: m } = await searchParams;
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : currentMonth();
  const supabase = await createClient();
  const { data: business } = await supabase.from("businesses").select("name").eq("id", businessId).maybeSingle();
  return { title: business ? `Laporan Gaji ${monthLabel(month)} - ${business.name}` : "Laporan Gaji" };
}

export default async function LaporanGajiPage({ params, searchParams }: { params: Promise<{ businessId: string }>; searchParams: Promise<{ month?: string }> }) {
  const { businessId } = await params;
  const { month: m } = await searchParams;
  const month = m && /^\d{4}-\d{2}$/.test(m) ? m : currentMonth();
  const monthStart = `${month}-01`;
  const monthEnd = lastDay(month);
  const base = `/business/${businessId}/payroll/laporan`;

  const supabase = await createClient();
  const [{ data: business }, { data: employees }, { data: slipRows }] = await Promise.all([
    supabase.from("businesses").select("name").eq("id", businessId).single(),
    supabase.from("employees").select("id, name").eq("business_id", businessId).eq("active", true).is("deleted_at", null).order("name", { ascending: true }),
    supabase
      .from("payslips")
      .select(SLIP_COLUMNS)
      .eq("business_id", businessId)
      .gte("period_start", monthStart)
      .lte("period_start", monthEnd)
      .order("created_at", { ascending: true }),
  ]);
  if (!business) notFound();

  type Emp = { name: string; bank_name: string | null; bank_account_number: string | null; bank_account_name: string | null } | null;
  const slips = (slipRows ?? []).map((s) => {
    const adjustments = ((s.payslip_adjustments ?? []) as { type: "tunjangan" | "potongan"; label: string; amount: number }[]).map((a) => ({ ...a, amount: Number(a.amount) }));
    const rows = payslipRows(s).filter((r) => r.value !== 0);
    const tunjangan = adjustments.filter((a) => a.type === "tunjangan");
    const potongan = adjustments.filter((a) => a.type === "potongan");
    const pendapatan = rows.filter((r) => r.value > 0).reduce((t, r) => t + r.value, 0) + tunjangan.reduce((t, a) => t + a.amount, 0);
    const totalPotongan = -rows.filter((r) => r.value < 0).reduce((t, r) => t + r.value, 0) + potongan.reduce((t, a) => t + a.amount, 0);
    const emp = s.employees as unknown as Emp;
    return { slip: s, emp, rows, tunjangan, potongan, pendapatan, totalPotongan, total: payslipTotal(s, adjustments) };
  });

  const withSlip = new Set(slips.map((r) => r.slip.employee_id));
  const belumAdaSlip = (employees ?? []).filter((e) => !withSlip.has(e.id));
  const grandTotal = slips.reduce((t, r) => t + r.total, 0);
  const belumDibayar = slips.filter((r) => !r.slip.paid_at);
  const totalBelumDibayar = belumDibayar.reduce((t, r) => t + r.total, 0);
  const totalBpjsPerusahaan = slips.reduce((t, r) => t + Number(r.slip.bpjs_employer_amount), 0);

  const bank = (e: Emp) => (e?.bank_name ? `${e.bank_name} ${e.bank_account_number ?? ""}${e.bank_account_name ? ` a.n. ${e.bank_account_name}` : ""}`.trim() : null);

  const whatsappText = [
    `*Laporan Pembayaran Gaji ${monthLabel(month)}*`,
    business.name,
    "",
    ...slips.map((r, i) => `${i + 1}. ${r.emp?.name ?? "—"}: *${rp(r.total)}*${r.slip.paid_at ? " (sudah dibayar)" : ""}${bank(r.emp) ? `\n    ${bank(r.emp)}` : ""}`),
    "",
    `*Total transfer: ${rp(grandTotal)}* (${slips.length} karyawan)`,
    ...(slips.length > belumDibayar.length && belumDibayar.length > 0 ? [`Belum dibayar: ${rp(totalBelumDibayar)} (${belumDibayar.length} karyawan)`] : []),
    ...(belumAdaSlip.length > 0 ? ["", `Belum dibuat slip (belum termasuk total): ${belumAdaSlip.map((e) => e.name).join(", ")}`] : []),
  ].join("\n");

  return (
    <div className="w-full max-w-3xl print:max-w-none">
      <style>{"@media print { @page { size: portrait; margin: 12mm; } }"}</style>

      <div className="flex flex-wrap items-start justify-between gap-2 print:hidden">
        <Link href={`/business/${businessId}/payroll`} className="text-sm text-zinc-500 hover:text-zinc-800">
          ← Payroll
        </Link>
        <div className="flex gap-2">
          <CopyWhatsappButton text={whatsappText} disabled={slips.length === 0} />
          <PrintReportButton />
        </div>
      </div>

      <div className="mt-3 print:mt-0">
        <p className="hidden text-sm font-semibold text-zinc-700 print:block">{business.name}</p>
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Laporan Pembayaran Gaji — {monthLabel(month)}</h1>
        <p className="mt-0.5 text-sm text-zinc-500 print:hidden">Hanya karyawan yang slip gajinya sudah dibuat. Tinggal transfer sesuai Total Transfer dan rekening tiap orang.</p>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 print:hidden">
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

      {slips.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-zinc-300 bg-white py-12 text-center text-sm text-zinc-500">
          Belum ada slip gaji di {monthLabel(month)}.{" "}
          <Link href={`/business/${businessId}/payroll/rekap`} className="text-brand-600 hover:underline print:hidden">
            Buat slip di Rekap Payroll
          </Link>
        </p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-3 gap-2 print:mt-3">
            <div className="rounded-xl border border-brand-200 bg-brand-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase text-brand-700">Total Transfer</p>
              <p className="mt-0.5 text-lg font-bold text-brand-700">{rp(grandTotal)}</p>
              <p className="text-[10px] text-brand-600">{slips.length} karyawan</p>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase text-amber-700">Belum Dibayar</p>
              <p className="mt-0.5 text-lg font-bold text-amber-700">{rp(totalBelumDibayar)}</p>
              <p className="text-[10px] text-amber-600">{belumDibayar.length} karyawan</p>
            </div>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold uppercase text-zinc-500">BPJS Ditanggung Perusahaan</p>
              <p className="mt-0.5 text-lg font-bold text-zinc-800">{rp(totalBpjsPerusahaan)}</p>
              <p className="text-[10px] text-zinc-500">tidak memotong gaji</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto rounded-xl border border-zinc-200 bg-white">
            <p className="border-b border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-semibold text-zinc-700">Daftar Transfer</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-zinc-200 text-left text-[10px] uppercase text-zinc-500">
                  <th className="px-3 py-1.5">No</th>
                  <th className="px-3 py-1.5">Nama / Rekening</th>
                  <th className="px-3 py-1.5 text-right">Pendapatan</th>
                  <th className="px-3 py-1.5 text-right">Potongan</th>
                  <th className="px-3 py-1.5 text-right">Total Transfer</th>
                  <th className="px-3 py-1.5 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {slips.map((r, i) => (
                  <tr key={r.slip.id} className="border-b border-zinc-100 last:border-0">
                    <td className="px-3 py-1.5 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-1.5">
                      <p className="font-medium text-zinc-900">{r.emp?.name ?? "—"}</p>
                      <p className="text-[10px] text-zinc-500">{bank(r.emp) ?? "Rekening belum diisi"}</p>
                    </td>
                    <td className="px-3 py-1.5 text-right">{rp(r.pendapatan)}</td>
                    <td className="px-3 py-1.5 text-right text-red-600">{r.totalPotongan > 0 ? `−${rp(r.totalPotongan)}` : "-"}</td>
                    <td className="px-3 py-1.5 text-right font-bold text-zinc-900">{rp(r.total)}</td>
                    <td className="px-3 py-1.5 text-center">{r.slip.paid_at ? <span className="text-emerald-700">Lunas</span> : <span className="text-amber-600">Belum dibayar</span>}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-zinc-200 bg-zinc-50 font-semibold">
                  <td className="px-3 py-1.5" colSpan={4}>
                    Total Transfer
                  </td>
                  <td className="px-3 py-1.5 text-right">{rp(grandTotal)}</td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>

          {belumAdaSlip.length > 0 && (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-700">
              Belum dibuat slip (belum termasuk total): {belumAdaSlip.map((e) => e.name).join(", ")}
            </p>
          )}

          <h2 className="mt-6 text-sm font-semibold text-zinc-900 print:mt-5">Rincian per Karyawan</h2>
          <div className="mt-2 grid gap-3 sm:grid-cols-2 print:grid-cols-2 print:gap-2">
            {slips.map((r) => (
              <div key={r.slip.id} className="break-inside-avoid rounded-xl border border-zinc-200 bg-white p-3 text-xs">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">{r.emp?.name ?? "—"}</p>
                    <p className="text-[10px] text-zinc-500">
                      {r.slip.period_start} — {r.slip.period_end}
                    </p>
                  </div>
                  <Link href={`/business/${businessId}/payroll/${r.slip.id}`} className="shrink-0 text-[10px] font-medium text-brand-600 hover:underline print:hidden">
                    Buka slip →
                  </Link>
                </div>
                <div className="mt-2 space-y-0.5">
                  {r.rows.map((l) => (
                    <div key={l.label} className="flex justify-between gap-2">
                      <span className={l.value < 0 ? "text-red-600" : "text-zinc-600"}>{l.label}</span>
                      <span className={l.value < 0 ? "text-red-600" : "text-zinc-900"}>
                        {l.value < 0 ? "−" : ""}
                        {rp(Math.abs(l.value))}
                      </span>
                    </div>
                  ))}
                  {r.tunjangan.map((a, i) => (
                    <div key={`t${i}`} className="flex justify-between gap-2">
                      <span className="text-zinc-600">{a.label}</span>
                      <span className="text-zinc-900">{rp(a.amount)}</span>
                    </div>
                  ))}
                  {r.potongan.map((a, i) => (
                    <div key={`p${i}`} className="flex justify-between gap-2 text-red-600">
                      <span>{a.label}</span>
                      <span>−{rp(a.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex justify-between border-t border-zinc-200 pt-1.5 text-sm font-bold">
                  <span>Total Transfer</span>
                  <span>{rp(r.total)}</span>
                </div>
                {bank(r.emp) && <p className="mt-1 text-[10px] text-zinc-500">{bank(r.emp)}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
