import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getOutstandingKasbon } from "@/lib/payroll/kasbon";
import { getOutstandingPersonalLoan } from "@/lib/payroll/personal-loan";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import PayslipDetailClient from "./payslip-detail-client";
import PrintButton from "./print-button";
import PayslipPrintView from "./payslip-print-view";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default async function PayslipDetailPage({
  params,
}: {
  params: Promise<{ businessId: string; payslipId: string }>;
}) {
  const { businessId, payslipId } = await params;
  const supabase = await createClient();

  const [{ data: payslip }, { data: business }] = await Promise.all([
    supabase
      .from("payslips")
      .select("*, employees(name)")
      .eq("id", payslipId)
      .eq("business_id", businessId)
      .single(),
    supabase.from("businesses").select("name, pph21_enabled").eq("id", businessId).single(),
  ]);

  if (!payslip) notFound();

  const { data: adjustmentRows } = await supabase
    .from("payslip_adjustments")
    .select("id, type, label, amount")
    .eq("payslip_id", payslipId)
    .order("created_at", { ascending: true });

  const adjustments = (adjustmentRows ?? []) as {
    id: string;
    type: "tunjangan" | "potongan";
    label: string;
    amount: number;
  }[];

  const [outstandingKasbon, outstandingPersonalLoan] = await Promise.all([
    getOutstandingKasbon(supabase, businessId, payslip.employee_id),
    getOutstandingPersonalLoan(supabase, businessId, payslip.employee_id),
  ]);
  const total = payslipTotal(payslip, adjustments);
  const employeeName = (payslip.employees as unknown as { name: string } | null)?.name ?? "—";
  const isPaid = !!payslip.paid_at;

  const rows: { label: string; value: number; muted?: boolean }[] = [
    {
      label: `Gaji Pokok (${payslip.hadir_count} hadir, ${payslip.sakit_count} sakit)`,
      value: payslip.base_pay,
    },
    { label: "Uang Makan", value: payslip.meal_allowance },
    { label: "Tunjangan Hadir", value: payslip.attendance_allowance },
    { label: `Lembur (${payslip.lembur_hours} jam)`, value: payslip.lembur_amount },
    { label: "THR", value: payslip.thr_amount },
    { label: `Potongan Izin (${payslip.izin_unnoted_count}x tanpa keterangan)`, value: -payslip.izin_deduction },
    { label: `Potongan Telat (${payslip.late_count}x)`, value: -payslip.late_deduction },
    { label: "Potongan Kasbon", value: -payslip.kasbon_deduction },
    { label: "Potongan Pinjaman Pribadi", value: -payslip.personal_loan_deduction },
    ...(payslip.pph21_amount > 0
      ? [
          {
            label: `Potongan PPh 21${payslip.ter_category ? ` (TER ${payslip.ter_category})` : ""}`,
            value: -payslip.pph21_amount,
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="print:hidden">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">{employeeName}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Periode {payslip.period_start} — {payslip.period_end} ·{" "}
            <span className={isPaid ? "text-emerald-600" : "text-amber-600"}>
              {isPaid ? "Lunas" : "Belum dibayar"}
            </span>
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-800">Rincian</h2>
          <div className="divide-y divide-zinc-100">
            {rows.map((r) => (
              <div key={r.label} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-zinc-500">{r.label}</span>
                <span className={r.value < 0 ? "font-medium text-red-500" : "font-medium text-zinc-900"}>
                  {r.value < 0 ? "-" : ""}
                  {fmtRupiah(Math.abs(r.value))}
                </span>
              </div>
            ))}
          </div>
        </div>

        <PayslipDetailClient
          businessId={businessId}
          payslipId={payslipId}
          employeeId={payslip.employee_id}
          isPaid={isPaid}
          lemburAmount={payslip.lembur_amount}
          thrAmount={payslip.thr_amount}
          kasbonDeduction={payslip.kasbon_deduction}
          outstandingKasbon={outstandingKasbon}
          personalLoanDeduction={payslip.personal_loan_deduction}
          outstandingPersonalLoan={outstandingPersonalLoan}
          pph21Amount={payslip.pph21_amount}
          pph21Enabled={business?.pph21_enabled ?? false}
          terCategory={payslip.ter_category}
          adjustments={adjustments}
          total={total}
        />
      </div>
      </div>

      <PayslipPrintView
        businessName={business?.name ?? "—"}
        employeeName={employeeName}
        periodStart={payslip.period_start}
        periodEnd={payslip.period_end}
        rows={rows}
        adjustments={adjustments}
        total={total}
        isPaid={isPaid}
      />
    </div>
  );
}
