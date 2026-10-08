import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";
import { monthRange, todayWib } from "@/lib/portal/dates";
import { loadAttendanceSummary } from "@/lib/payroll/aggregate";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { loadEmployeeLedgers, type LedgerSummary } from "@/lib/portal/ledgers";
import { logoutPortal } from "./actions";
import { OvertimeRequestForm, PortalLoginForm } from "./portal-forms";

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

const OVERTIME_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-600" },
};

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-800">{title}</h2>
      {children}
    </section>
  );
}

function LedgerCard({ title, ledger }: { title: string; ledger: LedgerSummary }) {
  return (
    <Card title={title}>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center">
          <p className="text-base font-bold text-zinc-900">{fmtRupiah(ledger.outstanding)}</p>
          <p className="text-[11px] text-zinc-500">Sisa belum lunas</p>
        </div>
        <div className="rounded-xl bg-zinc-50 px-3 py-2.5 text-center">
          <p className="text-base font-bold text-amber-600">{fmtRupiah(ledger.pendingDeduction)}</p>
          <p className="text-[11px] text-zinc-500">Akan dipotong di slip berikut</p>
        </div>
      </div>
      <div className="mt-3 divide-y divide-zinc-100">
        {ledger.entries.slice(0, 10).map((e, i) => (
          <div key={`${e.date}-${i}`} className="flex items-start justify-between gap-3 py-2 text-sm">
            <div className="min-w-0">
              <p className="text-zinc-700">{e.label}</p>
              <p className="text-[11px] text-zinc-400">
                {e.date}
                {e.kind === "akan_dipotong" && " · slip belum dibayar"}
              </p>
            </div>
            <span
              className={`shrink-0 font-medium ${
                e.kind === "pemberian" ? "text-zinc-900" : e.kind === "potongan" ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              {e.kind === "pemberian" ? "+" : "−"}
              {fmtRupiah(e.amount)}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Shell({ businessName, children }: { businessName: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-8">
      <div className="mx-auto w-full max-w-md space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-bold text-zinc-900">{businessName}</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Portal Karyawan</p>
        </div>
        {children}
      </div>
    </div>
  );
}

export default async function PortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const business = await loadPortalBusiness(slug);

  if (!business) {
    return (
      <Shell businessName="Link Tidak Valid">
        <Card title="Portal tidak ditemukan">
          <p className="text-sm text-zinc-500">Hubungi admin bisnis kamu untuk link yang benar.</p>
        </Card>
      </Shell>
    );
  }

  const supabase = createServiceClient();
  const employee = await getPortalEmployee(business);

  if (!employee) {
    const { data: employees } = await supabase
      .from("employees")
      .select("id, name, note")
      .eq("business_id", business.id)
      .eq("active", true)
      .is("deleted_at", null)
      .not("attendance_pin_hash", "is", null)
      .order("created_at", { ascending: true });

    return (
      <Shell businessName={business.name}>
        <Card title="Masuk">
          {(employees ?? []).length === 0 ? (
            <p className="text-sm text-zinc-500">
              Belum ada karyawan yang punya PIN absen. Minta admin memasangkan PIN dulu.
            </p>
          ) : (
            <PortalLoginForm slug={slug} employees={employees ?? []} />
          )}
          <p className="mt-4 text-center text-[11px] text-zinc-400">
            Pakai PIN yang sama dengan PIN absen selfie. Lupa PIN? Minta admin menggantinya.
          </p>
        </Card>
      </Shell>
    );
  }

  const today = todayWib();
  const month = monthRange(today);
  const year = today.slice(0, 4);

  const [
    { summary, overtimeHoursTotal },
    { data: leaveTypes },
    { data: approvedLeaves },
    { data: payslips },
    { data: overtimeRequests },
    ledgers,
  ] = await Promise.all([
    loadAttendanceSummary(supabase, business.id, employee.id, month.start, month.end),
    supabase
      .from("leave_types")
      .select("id, name, default_days_per_year")
      .eq("business_id", business.id)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("leave_requests")
      .select("leave_type_id, days_count")
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .eq("status", "approved")
      .gte("start_date", `${year}-01-01`)
      .lte("start_date", `${year}-12-31`),
    supabase
      .from("payslips")
      .select(
        "id, period_start, period_end, paid_at, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount",
      )
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .order("period_start", { ascending: false })
      .limit(12),
    business.overtime_approval_required
      ? supabase
          .from("overtime_requests")
          .select("id, date, hours, reason, status, reviewed_note")
          .eq("business_id", business.id)
          .eq("employee_id", employee.id)
          .order("date", { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] as { id: string; date: string; hours: number; reason: string | null; status: string; reviewed_note: string | null }[] }),
    loadEmployeeLedgers(supabase, business.id, employee.id),
  ]);

  const payslipIds = (payslips ?? []).map((p) => p.id);
  const { data: adjustments } = payslipIds.length
    ? await supabase
        .from("payslip_adjustments")
        .select("payslip_id, type, amount")
        .in("payslip_id", payslipIds)
    : { data: [] as { payslip_id: string; type: string; amount: number }[] };

  const usedByType = new Map<string, number>();
  for (const l of approvedLeaves ?? []) {
    usedByType.set(l.leave_type_id, (usedByType.get(l.leave_type_id) ?? 0) + l.days_count);
  }

  const izinTotal = summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend;
  const stats = [
    { label: "Hadir", value: summary.hadir },
    { label: "Telat", value: summary.lateMinutesList.length },
    { label: "Izin", value: izinTotal },
    { label: "Sakit", value: summary.sakit },
    { label: "Alpa", value: summary.alpa },
    {
      label: business.overtime_approval_required ? "Lembur disetujui" : "Lembur",
      value: `${overtimeHoursTotal} j`,
    },
  ];

  return (
    <Shell businessName={business.name}>
      <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm">
        <div>
          <p className="text-sm font-semibold text-zinc-900">{employee.name}</p>
          {employee.note && <p className="text-xs text-zinc-400">{employee.note}</p>}
        </div>
        <form action={logoutPortal.bind(null, slug)}>
          <button type="submit" className="text-xs font-semibold text-zinc-500 hover:text-zinc-800">
            Keluar
          </button>
        </form>
      </div>

      <Card title={`Absensi bulan ini (${month.start.slice(0, 7)})`}>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl bg-zinc-50 px-2 py-2.5 text-center">
              <p className="text-lg font-bold text-zinc-900">{s.value}</p>
              <p className="text-[11px] text-zinc-500">{s.label}</p>
            </div>
          ))}
        </div>
        <Link
          href={`/absen/${slug}`}
          className="mt-3 block text-center text-xs font-semibold text-brand-600 hover:underline"
        >
          Buka halaman absen selfie →
        </Link>
      </Card>

      <Card title={`Sisa cuti ${year}`}>
        {(leaveTypes ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada jenis cuti.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {(leaveTypes ?? []).map((lt) => {
              const used = usedByType.get(lt.id) ?? 0;
              const remaining = Math.max(0, lt.default_days_per_year - used);
              return (
                <div key={lt.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-zinc-600">{lt.name}</span>
                  <span className="font-semibold text-zinc-900">
                    {remaining} <span className="font-normal text-zinc-400">/ {lt.default_days_per_year} hari</span>
                  </span>
                </div>
              );
            })}
          </div>
        )}
        {business.leave_request_slug && (
          <Link
            href={`/cuti/${business.leave_request_slug}`}
            className="mt-3 block text-center text-xs font-semibold text-brand-600 hover:underline"
          >
            Ajukan cuti →
          </Link>
        )}
      </Card>

      <Card title="Slip gaji">
        {(payslips ?? []).length === 0 ? (
          <p className="text-sm text-zinc-500">Belum ada slip gaji.</p>
        ) : (
          <div className="divide-y divide-zinc-100">
            {(payslips ?? []).map((p) => {
              const total = payslipTotal(
                p,
                (adjustments ?? [])
                  .filter((a) => a.payslip_id === p.id)
                  .map((a) => ({ type: a.type as "tunjangan" | "potongan", amount: a.amount })),
              );
              return (
                <Link
                  key={p.id}
                  href={`/karyawan/${slug}/slip/${p.id}`}
                  prefetch={false}
                  className="flex items-center justify-between py-2.5 text-sm hover:bg-zinc-50"
                >
                  <div>
                    <p className="text-zinc-800">
                      {p.period_start} — {p.period_end}
                    </p>
                    <p className={`text-[11px] ${p.paid_at ? "text-emerald-600" : "text-amber-600"}`}>
                      {p.paid_at ? "Sudah dibayar" : "Belum dibayar (masih bisa berubah)"}
                    </p>
                  </div>
                  <span className="font-semibold text-zinc-900">{fmtRupiah(total)}</span>
                </Link>
              );
            })}
          </div>
        )}
      </Card>

      {ledgers.kasbon.entries.length > 0 && <LedgerCard title="Kasbon" ledger={ledgers.kasbon} />}
      {ledgers.personalLoan.entries.length > 0 && (
        <LedgerCard title="Pinjaman Pribadi" ledger={ledgers.personalLoan} />
      )}

      {business.overtime_approval_required && (
        <Card title="Lembur">
          <OvertimeRequestForm slug={slug} today={today} />
          {(overtimeRequests ?? []).length > 0 && (
            <div className="mt-4 divide-y divide-zinc-100 border-t border-zinc-100">
              {(overtimeRequests ?? []).map((o) => {
                const status = OVERTIME_STATUS[o.status] ?? OVERTIME_STATUS.pending;
                return (
                  <div key={o.id} className="flex items-start justify-between gap-3 py-2.5 text-sm">
                    <div>
                      <p className="text-zinc-800">
                        {o.date} · {Number(o.hours)} jam
                      </p>
                      {o.reason && <p className="text-xs text-zinc-400">{o.reason}</p>}
                      {o.status === "rejected" && o.reviewed_note && (
                        <p className="text-xs text-red-500">Alasan: {o.reviewed_note}</p>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      )}
    </Shell>
  );
}
