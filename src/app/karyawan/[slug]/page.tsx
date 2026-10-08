import Link from "next/link";
import {
  Camera,
  CalendarCheck,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  Clock,
  HandCoins,
  House,
  Landmark,
  LogOut,
  Palmtree,
  Receipt,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";
import { monthRange, todayWib } from "@/lib/portal/dates";
import { loadAttendanceSummary } from "@/lib/payroll/aggregate";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { loadEmployeeLedgers, type LedgerSummary } from "@/lib/portal/ledgers";
import { logoutPortal } from "./actions";
import { OvertimeRequestForm, PortalLoginForm } from "./portal-forms";
import {
  Badge,
  BottomNav,
  Card,
  EmptyState,
  Hero,
  QuickAction,
  fmtDate,
  fmtPeriod,
  fmtRupiah,
} from "./ui";

type Tab = "beranda" | "gaji" | "lembur";

const OVERTIME_STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  pending: { label: "Menunggu", tone: "amber" },
  approved: { label: "Disetujui", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
};

function greeting() {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Jakarta", hour: "2-digit", hour12: false }).format(new Date()),
  );
  if (hour < 11) return "Selamat pagi";
  if (hour < 15) return "Selamat siang";
  if (hour < 18) return "Selamat sore";
  return "Selamat malam";
}

function StatTile({ icon: Icon, label, value, tone }: { icon: LucideIcon; label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl bg-zinc-50 p-3">
      <span className={`flex h-8 w-8 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <p className="mt-2 text-xl font-bold tabular-nums text-zinc-900">{value}</p>
      <p className="text-[11px] text-zinc-500">{label}</p>
    </div>
  );
}

const ATTENDANCE_STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" | "zinc" }> = {
  hadir: { label: "Hadir", tone: "green" },
  izin: { label: "Izin", tone: "zinc" },
  sakit: { label: "Sakit", tone: "zinc" },
  alpa: { label: "Alpa", tone: "red" },
  off: { label: "Off", tone: "zinc" },
};

function fmtClock(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
}

type AttendanceHistoryRow = {
  date: string;
  status: string;
  note: string | null;
  late: boolean;
  late_minutes: number;
  overtime_hours: number;
  check_in_at: string | null;
  check_out_at: string | null;
  verified_by_admin: boolean;
};

const HISTORY_VISIBLE_DAYS = 7;

function AttendanceHistory({ rows }: { rows: AttendanceHistoryRow[] }) {
  if (rows.length === 0) return <EmptyState icon={CalendarCheck} text="Belum ada absen bulan ini." />;
  const visible = rows.slice(0, HISTORY_VISIBLE_DAYS);
  const rest = rows.slice(HISTORY_VISIBLE_DAYS);
  return (
    <>
      <AttendanceHistoryList rows={visible} />
      {rest.length > 0 && (
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 border-t border-zinc-100 pt-3 text-xs font-semibold text-brand-600 group-open:hidden">
            Tampilkan semua ({rows.length} hari)
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </summary>
          <div className="border-t border-zinc-100">
            <AttendanceHistoryList rows={rest} />
          </div>
        </details>
      )}
    </>
  );
}

function AttendanceHistoryList({ rows }: { rows: AttendanceHistoryRow[] }) {
  return (
    <ul className="divide-y divide-zinc-100">
      {rows.map((r) => {
        const status = ATTENDANCE_STATUS[r.status] ?? ATTENDANCE_STATUS.hadir;
        // Absen selfie (punya jam masuk) yang belum dicek admin. Absen yang
        // diinput admin sendiri tidak perlu verifikasi.
        const awaitingVerification = !!r.check_in_at && !r.verified_by_admin;
        const overtime = Number(r.overtime_hours);
        return (
          <li key={r.date} className="flex items-start justify-between gap-3 py-3">
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-900">
                {fmtDate(r.date, { weekday: "short", day: "numeric", month: "short" })}
              </p>
              {r.check_in_at ? (
                <p className="text-xs tabular-nums text-zinc-500">
                  Masuk {fmtClock(r.check_in_at)} · Pulang {fmtClock(r.check_out_at)}
                </p>
              ) : (
                r.note && <p className="truncate text-xs text-zinc-500">{r.note}</p>
              )}
              {(r.late || overtime > 0) && (
                <p className="mt-0.5 text-xs">
                  {r.late && (
                    <span className="font-semibold text-amber-600">
                      Telat{r.late_minutes > 0 ? ` ${r.late_minutes} mnt` : ""}
                    </span>
                  )}
                  {r.late && overtime > 0 && <span className="text-zinc-300"> · </span>}
                  {overtime > 0 && (
                    <span className="font-semibold text-brand-600">Lembur {overtime.toLocaleString("id-ID")} jam</span>
                  )}
                </p>
              )}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <Badge tone={status.tone}>{status.label}</Badge>
              {awaitingVerification ? (
                <span className="text-[10px] font-medium text-amber-600">Menunggu verifikasi</span>
              ) : r.check_in_at ? (
                <span className="text-[10px] font-medium text-emerald-600">✓ Terverifikasi</span>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function LedgerCard({ title, icon, ledger }: { title: string; icon: LucideIcon; ledger: LedgerSummary }) {
  const totalGiven = ledger.entries.filter((e) => e.kind === "pemberian").reduce((s, e) => s + e.amount, 0);
  const paidPercent = totalGiven > 0 ? Math.min(100, Math.round(((totalGiven - ledger.outstanding) / totalGiven) * 100)) : 100;

  return (
    <Card title={title} icon={icon}>
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">Sisa belum lunas</p>
          <p className="text-2xl font-bold tabular-nums text-zinc-900">{fmtRupiah(ledger.outstanding)}</p>
        </div>
        {ledger.outstanding === 0 ? <Badge tone="green">Lunas</Badge> : <Badge tone="zinc">{paidPercent}% terbayar</Badge>}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-100">
        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${paidPercent}%` }} />
      </div>
      {ledger.pendingDeduction > 0 && (
        <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
          <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {fmtRupiah(ledger.pendingDeduction)} akan dipotong di slip yang belum dibayar
        </p>
      )}
      <details className="group mt-3">
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-brand-600">
          Riwayat
          <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <ul className="mt-2 divide-y divide-zinc-100">
          {ledger.entries.slice(0, 10).map((e, i) => (
            <li key={`${e.date}-${i}`} className="flex items-start justify-between gap-3 py-2.5 text-sm">
              <div className="min-w-0">
                <p className="truncate text-zinc-700">
                  {e.period ? `${e.label} ${fmtPeriod(e.period.start, e.period.end)}` : e.label}
                </p>
                <p className="text-[11px] text-zinc-400">
                  {fmtDate(e.date)}
                  {e.kind === "akan_dipotong" && " · slip belum dibayar"}
                </p>
              </div>
              <span
                className={`shrink-0 font-semibold tabular-nums ${
                  e.kind === "pemberian" ? "text-zinc-900" : e.kind === "potongan" ? "text-emerald-600" : "text-amber-600"
                }`}
              >
                {e.kind === "pemberian" ? "+" : "−"}
                {fmtRupiah(e.amount)}
              </span>
            </li>
          ))}
        </ul>
      </details>
    </Card>
  );
}

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { slug } = await params;
  const { tab: tabParam } = await searchParams;
  const business = await loadPortalBusiness(slug);

  if (!business) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Hero businessName="ABSENKU" title="Link tidak ditemukan" subtitle="Hubungi admin bisnis kamu untuk link portal yang benar." />
      </div>
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
      <div className="min-h-screen bg-zinc-50">
        <Hero
          businessName={business.name}
          title="Portal Karyawan"
          subtitle="Lihat slip gaji, sisa cuti, kasbon, dan ajukan lembur dari HP kamu."
        />
        <main className="relative z-10 mx-auto -mt-4 max-w-md px-4 pb-10">
          <Card title="Masuk" icon={UserRound}>
            {(employees ?? []).length === 0 ? (
              <EmptyState icon={CircleAlert} text="Belum ada karyawan yang punya PIN absen. Minta admin memasangkan PIN dulu." />
            ) : (
              <PortalLoginForm slug={slug} employees={employees ?? []} />
            )}
            <p className="mt-4 text-center text-[11px] text-zinc-400">
              Pakai PIN yang sama dengan PIN absen selfie. Lupa PIN? Minta admin menggantinya.
            </p>
          </Card>
        </main>
      </div>
    );
  }

  const tabs: { key: Tab; label: string; icon: LucideIcon }[] = [
    { key: "beranda", label: "Beranda", icon: House },
    { key: "gaji", label: "Gaji", icon: Wallet },
    ...(business.overtime_approval_required ? [{ key: "lembur" as const, label: "Lembur", icon: Clock }] : []),
  ];
  const tab: Tab = tabs.some((t) => t.key === tabParam) ? (tabParam as Tab) : "beranda";

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
    { data: attendanceRows },
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
    supabase
      .from("attendance")
      .select("date, status, note, late, late_minutes, overtime_hours, check_in_at, check_out_at, verified_by_admin")
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .gte("date", month.start)
      .lte("date", month.end)
      .order("date", { ascending: false }),
  ]);

  const payslipIds = (payslips ?? []).map((p) => p.id);
  const { data: adjustments } = payslipIds.length
    ? await supabase.from("payslip_adjustments").select("payslip_id, type, amount").in("payslip_id", payslipIds)
    : { data: [] as { payslip_id: string; type: string; amount: number }[] };

  const slips = (payslips ?? []).map((p) => ({
    ...p,
    total: payslipTotal(
      p,
      (adjustments ?? [])
        .filter((a) => a.payslip_id === p.id)
        .map((a) => ({ type: a.type as "tunjangan" | "potongan", amount: a.amount })),
    ),
  }));
  const latestSlip = slips[0] ?? null;

  const usedByType = new Map<string, number>();
  for (const l of approvedLeaves ?? []) {
    usedByType.set(l.leave_type_id, (usedByType.get(l.leave_type_id) ?? 0) + l.days_count);
  }

  const awaitingVerificationCount = (attendanceRows ?? []).filter(
    (r) => r.check_in_at && !r.verified_by_admin,
  ).length;
  const lateMinutesTotal = summary.lateMinutesList.reduce((s, m) => s + m, 0);
  const izinTotal = summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend;
  const firstName = employee.name.split(" ")[0];
  const tabHref = (key: Tab) => (key === "beranda" ? `/karyawan/${slug}` : `/karyawan/${slug}?tab=${key}`);
  const pendingOvertime = (overtimeRequests ?? []).filter((o) => o.status === "pending").length;

  return (
    <div className="min-h-screen bg-zinc-50 pb-24">
      <Hero
        businessName={business.name}
        title={`${greeting()}, ${firstName} 👋`}
        subtitle={`${fmtDate(today, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}${employee.note ? ` · ${employee.note}` : ""}`}
        right={
          <form action={logoutPortal.bind(null, slug)}>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium ring-1 ring-white/20 hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Keluar
            </button>
          </form>
        }
      >
        <div className={`mt-5 grid gap-2 ${business.leave_request_slug && business.overtime_approval_required ? "grid-cols-3" : "grid-cols-2"}`}>
          <QuickAction href={`/absen/${slug}`} icon={Camera} label="Absen selfie" />
          {business.leave_request_slug && (
            <QuickAction href={`/cuti/${business.leave_request_slug}`} icon={Palmtree} label="Ajukan cuti" />
          )}
          {business.overtime_approval_required && (
            <QuickAction href={tabHref("lembur")} icon={Clock} label="Ajukan lembur" />
          )}
        </div>
      </Hero>

      <main className="relative z-10 mx-auto -mt-4 max-w-md space-y-4 px-4">
        {tab === "beranda" && (
          <>
            {latestSlip && (
              <Link
                href={`/karyawan/${slug}/slip/${latestSlip.id}`}
                prefetch={false}
                className="block rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-zinc-500">Gaji {fmtPeriod(latestSlip.period_start, latestSlip.period_end)}</p>
                  {latestSlip.paid_at ? <Badge tone="green">Sudah dibayar</Badge> : <Badge tone="amber">Belum dibayar</Badge>}
                </div>
                <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-zinc-900">{fmtRupiah(latestSlip.total)}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-brand-600">
                  Lihat rincian slip <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </p>
              </Link>
            )}

            <Card title={`Absensi ${fmtDate(month.start, { month: "long" })}`} icon={CalendarCheck}>
              <div className="grid grid-cols-3 gap-2">
                <StatTile icon={CalendarCheck} label="Hadir" value={summary.hadir} tone="bg-emerald-50 text-emerald-600" />
                <StatTile
                  icon={Clock}
                  label={lateMinutesTotal > 0 ? `Telat (${lateMinutesTotal} mnt)` : "Telat"}
                  value={summary.lateMinutesList.length}
                  tone="bg-amber-50 text-amber-600"
                />
                <StatTile icon={Palmtree} label="Izin / cuti" value={izinTotal} tone="bg-sky-50 text-sky-600" />
                <StatTile icon={CircleAlert} label="Sakit" value={summary.sakit} tone="bg-violet-50 text-violet-600" />
                <StatTile icon={CircleAlert} label="Alpa" value={summary.alpa} tone="bg-red-50 text-red-500" />
                <StatTile icon={Clock} label="Jam lembur" value={overtimeHoursTotal.toLocaleString("id-ID")} tone="bg-brand-50 text-brand-600" />
              </div>
            {awaitingVerificationCount > 0 && (
                <p className="mt-3 flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  {awaitingVerificationCount} absen menunggu verifikasi admin
                </p>
              )}
            </Card>

            <Card title="Riwayat absen" icon={CalendarCheck}>
              <AttendanceHistory rows={attendanceRows ?? []} />
            </Card>

            <Card title={`Sisa cuti ${year}`} icon={Palmtree}>
              {(leaveTypes ?? []).length === 0 ? (
                <EmptyState icon={Palmtree} text="Belum ada jenis cuti." />
              ) : (
                <ul className="space-y-3.5">
                  {(leaveTypes ?? []).map((lt) => {
                    const quota = Number(lt.default_days_per_year);
                    const used = usedByType.get(lt.id) ?? 0;
                    const remaining = Math.max(0, quota - used);
                    const pct = quota > 0 ? Math.round((remaining / quota) * 100) : 0;
                    return (
                      <li key={lt.id}>
                        <div className="flex items-baseline justify-between text-sm">
                          <span className="text-zinc-700">{lt.name}</span>
                          <span className="tabular-nums">
                            <span className="font-bold text-zinc-900">{remaining}</span>
                            <span className="text-zinc-400"> / {quota} hari</span>
                          </span>
                        </div>
                        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </>
        )}

        {tab === "gaji" && (
          <>
            <Card title="Slip gaji" icon={Receipt}>
              {slips.length === 0 ? (
                <EmptyState icon={Receipt} text="Belum ada slip gaji." />
              ) : (
                <ul className="-mx-2">
                  {slips.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/karyawan/${slug}/slip/${p.id}`}
                        prefetch={false}
                        className="flex items-center gap-3 rounded-2xl px-2 py-3 transition-colors hover:bg-zinc-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                          <Receipt className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-zinc-900">{fmtPeriod(p.period_start, p.period_end)}</p>
                          <p className={`text-[11px] ${p.paid_at ? "text-emerald-600" : "text-amber-600"}`}>
                            {p.paid_at ? "Sudah dibayar" : "Belum dibayar"}
                          </p>
                        </div>
                        <span className="text-sm font-bold tabular-nums text-zinc-900">{fmtRupiah(p.total)}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {ledgers.kasbon.entries.length > 0 && <LedgerCard title="Kasbon" icon={HandCoins} ledger={ledgers.kasbon} />}
            {ledgers.personalLoan.entries.length > 0 && (
              <LedgerCard title="Pinjaman Pribadi" icon={Landmark} ledger={ledgers.personalLoan} />
            )}
          </>
        )}

        {tab === "lembur" && (
          <>
            <Card title="Ajukan lembur" icon={Clock}>
              <OvertimeRequestForm slug={slug} today={today} />
            </Card>
            <Card
              title="Riwayat lembur"
              icon={CalendarCheck}
              action={pendingOvertime > 0 ? <Badge tone="amber">{pendingOvertime} menunggu</Badge> : undefined}
            >
              {(overtimeRequests ?? []).length === 0 ? (
                <EmptyState icon={Clock} text="Belum ada pengajuan lembur." />
              ) : (
                <ul className="divide-y divide-zinc-100">
                  {(overtimeRequests ?? []).map((o) => {
                    const status = OVERTIME_STATUS[o.status] ?? OVERTIME_STATUS.pending;
                    return (
                      <li key={o.id} className="flex items-start justify-between gap-3 py-3">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-zinc-900">
                            {fmtDate(o.date, { weekday: "short", day: "numeric", month: "short" })} ·{" "}
                            {Number(o.hours).toLocaleString("id-ID")} jam
                          </p>
                          {o.reason && <p className="truncate text-xs text-zinc-500">{o.reason}</p>}
                          {o.status === "rejected" && o.reviewed_note && (
                            <p className="text-xs text-red-500">Alasan: {o.reviewed_note}</p>
                          )}
                        </div>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>
          </>
        )}
      </main>

      <BottomNav items={tabs.map((t) => ({ ...t, href: tabHref(t.key) }))} active={tab} />
    </div>
  );
}
