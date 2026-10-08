import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, Landmark, Receipt } from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { bpjsEmployerRows, payslipRows } from "@/lib/payroll/payslip-rows";
import { Badge, Card, Hero, fmtPeriod, fmtRupiah } from "../../ui";

function Row({ label, value, strong }: { label: string; value: number; strong?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className={strong ? "font-semibold text-zinc-900" : "text-zinc-500"}>{label}</span>
      <span className={`shrink-0 tabular-nums ${value < 0 ? "text-red-500" : strong ? "font-semibold text-zinc-900" : "text-zinc-900"}`}>
        {value < 0 ? "−" : ""}
        {fmtRupiah(Math.abs(value))}
      </span>
    </div>
  );
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
  const allRows = [
    ...rows,
    ...adjustments.map((a) => ({ label: a.label, value: a.type === "potongan" ? -a.amount : a.amount })),
  ];
  const income = allRows.filter((r) => r.value > 0);
  const deductions = allRows.filter((r) => r.value < 0);
  const incomeTotal = income.reduce((s, r) => s + r.value, 0);
  const deductionTotal = deductions.reduce((s, r) => s + r.value, 0);
  const employerRows = bpjsEmployerRows(payslip.bpjs_detail);
  const total = payslipTotal(payslip, adjustments);

  return (
    <div className="min-h-screen bg-zinc-50 pb-10">
      <Hero
        businessName={business.name}
        title={fmtRupiah(total)}
        subtitle={`Gaji bersih ${employee.name} · ${fmtPeriod(payslip.period_start, payslip.period_end)}`}
        right={
          <Link
            href={`/karyawan/${slug}?tab=gaji`}
            prefetch={false}
            className="flex items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 hover:bg-white/20"
          >
            <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Kembali
          </Link>
        }
      >
        <div className="mt-3">
          {payslip.paid_at ? (
            <Badge tone="green">Sudah dibayar</Badge>
          ) : (
            <Badge tone="amber">Belum dibayar · masih bisa berubah</Badge>
          )}
        </div>
      </Hero>

      <main className="relative z-10 mx-auto -mt-4 max-w-md space-y-4 px-4">
        <Card title="Rincian" icon={Receipt}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Pendapatan</p>
          <div className="divide-y divide-zinc-100">
            {income.map((r) => (
              <Row key={r.label} label={r.label} value={r.value} />
            ))}
            <Row label="Total pendapatan" value={incomeTotal} strong />
          </div>

          {deductions.length > 0 && (
            <>
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">Potongan</p>
              <div className="divide-y divide-zinc-100">
                {deductions.map((r) => (
                  <Row key={r.label} label={r.label} value={r.value} />
                ))}
                <Row label="Total potongan" value={deductionTotal} strong />
              </div>
            </>
          )}

          <div className="mt-4 flex items-center justify-between rounded-2xl bg-brand-50 px-4 py-3">
            <span className="text-sm font-semibold text-brand-700">Gaji bersih diterima</span>
            <span className="text-lg font-bold tabular-nums text-brand-700">{fmtRupiah(total)}</span>
          </div>
        </Card>

        {employerRows.length > 0 && (
          <Card title="BPJS dibayar perusahaan" icon={Landmark}>
            <p className="-mt-2 mb-2 text-xs text-zinc-500">Iuran ini tidak memotong gajimu.</p>
            <div className="divide-y divide-zinc-100">
              {employerRows.map((r) => (
                <Row key={r.label} label={r.label} value={r.value} />
              ))}
              <Row label="Total" value={employerRows.reduce((s, r) => s + r.value, 0)} strong />
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
