import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { bpjsEmployerRows, payslipRows } from "@/lib/payroll/payslip-rows";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default async function PortalPayslipPage({
  params,
}: {
  params: Promise<{ slug: string; payslipId: string }>;
}) {
  const { slug, payslipId } = await params;
  const business = await loadPortalBusiness(slug);
  if (!business) notFound();
  const employee = await getPortalEmployee(business);
  if (!employee) redirect(`/karyawan/${slug}`);

  const supabase = createServiceClient();
  // Di-scope ke business + employee dari sesi — karyawan tidak bisa membuka
  // slip orang lain walau menebak id-nya.
  const { data: payslip } = await supabase
    .from("payslips")
    .select("*")
    .eq("id", payslipId)
    .eq("business_id", business.id)
    .eq("employee_id", employee.id)
    .maybeSingle();
  if (!payslip) notFound();

  const { data: adjustmentRows } = await supabase
    .from("payslip_adjustments")
    .select("id, type, label, amount")
    .eq("payslip_id", payslip.id)
    .order("created_at", { ascending: true });
  const adjustments = (adjustmentRows ?? []) as {
    id: string;
    type: "tunjangan" | "potongan";
    label: string;
    amount: number;
  }[];

  const rows = payslipRows(payslip).filter((r) => r.value !== 0);
  const employerRows = bpjsEmployerRows(payslip.bpjs_detail);
  const total = payslipTotal(payslip, adjustments);

  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <Link href={`/karyawan/${slug}`} className="text-xs font-semibold text-brand-600 hover:underline">
          ← Kembali
        </Link>
        <section className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-xs text-zinc-400">{business.name}</p>
          <h1 className="text-lg font-bold text-zinc-900">Slip Gaji {employee.name}</h1>
          <p className="mt-0.5 text-xs text-zinc-500">
            Periode {payslip.period_start} — {payslip.period_end} ·{" "}
            <span className={payslip.paid_at ? "text-emerald-600" : "text-amber-600"}>
              {payslip.paid_at ? "Sudah dibayar" : "Belum dibayar (masih bisa berubah)"}
            </span>
          </p>

          <div className="mt-4 divide-y divide-zinc-100">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2 text-sm">
                <span className="text-zinc-500">{r.label}</span>
                <span className={r.value < 0 ? "text-red-500" : "text-zinc-900"}>
                  {r.value < 0 ? "-" : ""}
                  {fmtRupiah(Math.abs(r.value))}
                </span>
              </div>
            ))}
            {adjustments.map((a) => (
              <div key={a.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-zinc-500">{a.label}</span>
                <span className={a.type === "potongan" ? "text-red-500" : "text-zinc-900"}>
                  {a.type === "potongan" ? "-" : ""}
                  {fmtRupiah(a.amount)}
                </span>
              </div>
            ))}
            <div className="flex items-center justify-between py-3 text-base font-bold">
              <span className="text-zinc-900">Total Diterima</span>
              <span className="text-zinc-900">{fmtRupiah(total)}</span>
            </div>
          </div>

          {employerRows.length > 0 && (
            <div className="mt-2 rounded-lg bg-zinc-50 p-3">
              <p className="mb-1 text-xs font-semibold text-zinc-600">
                Iuran BPJS dibayar perusahaan untukmu
              </p>
              {employerRows.map((r) => (
                <div key={r.label} className="flex justify-between py-0.5 text-xs text-zinc-500">
                  <span>{r.label}</span>
                  <span>{fmtRupiah(r.value)}</span>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
