import Link from "next/link";
import {
  CalendarCheck,
  CalendarDays,
  ChevronDown,
  ChevronRight,
  CircleAlert,
  AlarmClock,
  BadgeCheck,
  Check,
  Clock,
  ClipboardList,
  Coins,
  FileText,
  House,
  IdCard,
  Info,
  Moon,
  TriangleAlert,
  UserCheck,
  HandCoins,
  Landmark,
  LogOut,
  Mail,
  MoreHorizontal,
  Receipt,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { createServiceClient } from "@/lib/supabase/service";
import { getPortalEmployee, loadPortalBusiness } from "@/lib/portal/session";
import { addDays, monthRange, todayWib } from "@/lib/portal/dates";
import { loadAttendanceSummary } from "@/lib/payroll/aggregate";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { loadEmployeeLedgers, type LedgerSummary } from "@/lib/portal/ledgers";
import { logoutPortal } from "./actions";
import MonthSelect from "./month-select";
import {
  MenuCard,
  MenuTile,
  PortalCard,
  PortalEmpty,
  PortalHeader,
  StatCard,
} from "./portal-ui";
import {
  ActivityForm,
  OvertimeRequestForm,
  PortalLoginForm,
  ReimbursementForm,
  TaskStatusSelect,
} from "./portal-forms";
import { reimbursementCategoryLabel } from "@/lib/reimbursement/categories";
import { LETTER_KINDS, isLetterKind } from "@/lib/letters/templates";
import { maskAccountNumber, maskNik, tenureLabel } from "@/lib/employees/identity";
import {
  Badge,
  Card,
  EmptyState,
  Hero,
  fmtDate,
  fmtPeriod,
  fmtRupiah,
} from "./ui";

type Page =
  | "home"
  | "lainnya"
  | "jadwal"
  | "kehadiran"
  | "cuti"
  | "lembur"
  | "gaji"
  | "surat"
  | "kegiatan"
  | "tugas"
  | "reimburse"
  | "profil";

const PAGES: Page[] = ["lainnya", "jadwal", "kehadiran", "cuti", "lembur", "gaji", "surat", "kegiatan", "tugas", "reimburse", "profil"];

const OVERTIME_STATUS: Record<string, { label: string; tone: "green" | "amber" | "red" }> = {
  pending: { label: "Menunggu", tone: "amber" },
  approved: { label: "Disetujui", tone: "green" },
  rejected: { label: "Ditolak", tone: "red" },
};

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
          <summary className="flex cursor-pointer list-none items-center justify-center gap-1 border-t border-zinc-100 pt-3 text-xs font-semibold text-portal-600 group-open:hidden">
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
                    <span className="font-semibold text-portal-600">Lembur {overtime.toLocaleString("id-ID")} jam</span>
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
        <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-portal-600">
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

const TASK_STATUSES = ["todo", "in_progress", "done"] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];
const asTaskStatus = (v: string): TaskStatus => (TASK_STATUSES as readonly string[]).includes(v) ? (v as TaskStatus) : "todo";

const hhmm = (t: string) => t.slice(0, 5);

function monthOptions(today: string) {
  const [y, m] = today.split("-").map(Number);
  const out: { value: string; label: string }[] = [];
  for (let i = 0; i < 12; i++) {
    const d = new Date(Date.UTC(y, m - 1 - i, 1));
    const value = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    out.push({ value, label: fmtDate(`${value}-01`, { month: "long", year: "numeric" }) });
  }
  return out;
}

function duration(inAt: string | null, outAt: string | null) {
  if (!inAt) return "0 jam 0 mnt";
  const end = outAt ? new Date(outAt).getTime() : Date.now();
  const mins = Math.max(0, Math.floor((end - new Date(inAt).getTime()) / 60000));
  return `${Math.floor(mins / 60)} jam ${mins % 60} mnt`;
}

type ShiftDay = { date: string; name: string; start: string; end: string };

async function loadSchedule(
  supabase: ReturnType<typeof createServiceClient>,
  businessId: string,
  employeeId: string,
  from: string,
  days: number,
): Promise<ShiftDay[]> {
  const [{ data: biz }, { data: rows }] = await Promise.all([
    supabase.from("businesses").select("work_start_time, work_end_time").eq("id", businessId).single(),
    supabase
      .from("employee_shift_assignments")
      .select("date, shift_templates(name, start_time, end_time)")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .gte("date", from)
      .lte("date", addDays(from, days - 1)),
  ]);
  const byDate = new Map(
    (rows ?? []).map((r) => [
      r.date,
      r.shift_templates as unknown as { name: string; start_time: string; end_time: string } | null,
    ]),
  );
  return Array.from({ length: days }, (_, i) => {
    const date = addDays(from, i);
    const t = byDate.get(date);
    return t
      ? { date, name: t.name, start: hhmm(t.start_time), end: hhmm(t.end_time) }
      : { date, name: "Reguler", start: hhmm(biz?.work_start_time ?? "08:00"), end: hhmm(biz?.work_end_time ?? "17:00") };
  });
}

function ScheduleTimeline({ days, today }: { days: ShiftDay[]; today: string }) {
  return (
    <ol className="relative space-y-3 pl-9">
      <span className="absolute bottom-3 left-[7px] top-3 w-px bg-portal-500" aria-hidden="true" />
      {days.map((d) => {
        const isToday = d.date === today;
        return (
          <li key={d.date} className="relative">
            <span
              className={`absolute -left-9 top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-portal-500 ${
                isToday ? "bg-portal-500" : "bg-portal-50"
              }`}
            />
            <div
              className={`flex items-center justify-between gap-3 rounded-2xl px-4 py-3 ${
                isToday ? "bg-portal-100" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <CalendarDays className="h-6 w-6 shrink-0 text-portal-500" strokeWidth={1.6} aria-hidden="true" />
                <div>
                  <p className="font-bold text-zinc-700">
                    {fmtDate(d.date, { weekday: "short", day: "2-digit", month: "long" })}
                  </p>
                  <p className="text-zinc-600">
                    {d.start} - {d.end}
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-4 py-1.5 text-sm ${
                  isToday ? "bg-portal-500 text-white" : "bg-portal-100 text-portal-700"
                }`}
              >
                {d.name}
              </span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export default async function PortalPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ p?: string; t?: string; m?: string; new?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
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

  const page: Page = (PAGES as string[]).includes(sp.p ?? "") ? (sp.p as Page) : "home";
  const isNew = sp.new === "1";
  const today = todayWib();
  const base = `/karyawan/${slug}`;
  const to = (p: Page, extra = "") => `${base}?p=${p}${extra}`;
  const shell = "min-h-screen bg-[#f6f6f6] pb-10";

  // ───────────────────────── Beranda ─────────────────────────
  if (page === "home") {
    const [{ data: todayRow }, schedule, { data: tasks }] = await Promise.all([
      supabase
        .from("attendance")
        .select("check_in_at, check_out_at")
        .eq("business_id", business.id)
        .eq("employee_id", employee.id)
        .eq("date", today)
        .maybeSingle(),
      loadSchedule(supabase, business.id, employee.id, today, 7),
      supabase
        .from("employee_tasks")
        .select("id, title, due_date, status")
        .eq("business_id", business.id)
        .eq("employee_id", employee.id)
        .neq("status", "done")
        .order("due_date", { ascending: true, nullsFirst: false })
        .limit(5),
    ]);
    const todayShift = schedule[0];
    const dueTasks = (tasks ?? []).filter((t) => !t.due_date || t.due_date <= today);

    return (
      <div className={shell}>
        <header className="bg-gradient-to-b from-portal-300 to-portal-800 pb-24 pt-5 text-center text-white">
          <div className="mx-auto flex max-w-md items-center justify-between px-5">
            <span className="h-10 w-10" />
            <div>
              <p className="text-lg font-bold tracking-tight">{business.name}</p>
              <p className="text-sm text-white/80">Portal Karyawan</p>
            </div>
            <form action={logoutPortal.bind(null, slug)}>
              <button
                type="submit"
                aria-label="Keluar"
                className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
              >
                <LogOut className="h-6 w-6" aria-hidden="true" />
              </button>
            </form>
          </div>
        </header>

        <main className="relative z-10 mx-auto -mt-20 max-w-md space-y-4 px-4">
          <PortalCard className="!rounded-3xl !p-5 shadow-lg">
            <Link href={to("profil")} prefetch={false} className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block max-w-full truncate rounded-xl bg-portal-700 px-4 py-2 text-white">
                  {business.name}
                </span>
                <p className="mt-3 truncate text-base font-bold text-zinc-700">{employee.name}</p>
                {employee.note && <p className="truncate italic text-zinc-600">{employee.note}</p>}
              </div>
              <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-2 border-portal-700 bg-zinc-200 text-xl font-bold text-zinc-500">
                {employee.name.charAt(0).toUpperCase()}
              </span>
            </Link>
            <p className="mt-3 text-zinc-700">
              {fmtDate(today, { weekday: "long", day: "2-digit", month: "short", year: "numeric" })}
            </p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <span className="rounded-xl border border-zinc-300 px-4 py-2 text-zinc-700">{todayShift.name}</span>
              <div className="text-right">
                <p className="text-base text-zinc-700">
                  {todayShift.start} - {todayShift.end}
                </p>
                <p className="flex items-center justify-end gap-1.5 text-sm italic text-zinc-500">
                  <Clock className="h-4 w-4 text-portal-500" aria-hidden="true" />
                  {duration(todayRow?.check_in_at ?? null, todayRow?.check_out_at ?? null)}
                </p>
              </div>
            </div>
            <hr className="my-4 border-zinc-300" />
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Check In", at: todayRow?.check_in_at ?? null },
                { label: "Check Out", at: todayRow?.check_out_at ?? null },
              ].map((b) => (
                <div key={b.label} className="rounded-2xl bg-portal-100 px-4 py-4">
                  <p className="text-sm text-zinc-600">{b.label}</p>
                  <p className="mt-3 text-xl font-medium tabular-nums text-zinc-700">
                    {b.at ? fmtClock(b.at) : "-- : --"}
                  </p>
                </div>
              ))}
            </div>
          </PortalCard>

          <div className="grid grid-cols-2 gap-3">
            <MenuCard href={`/absen/${slug}`} icon={ClipboardList} accent={Clock} label="Check In" />
            <MenuCard href={`/absen/${slug}`} icon={ClipboardList} accent={Clock} label="Check Out" />
            <MenuCard href={to("cuti")} icon={UserRound} accent={Check} label="Cuti" />
            <MenuCard href={to("lembur")} icon={AlarmClock} accent={Moon} label="Lembur" />
            <MenuCard href={to("tugas")} icon={FileText} accent={BadgeCheck} label="Tugas" />
            <MenuCard href={to("lainnya")} icon={MoreHorizontal} label="Lainnya" />
          </div>

          <section>
            <div className="mb-2 flex items-center justify-between px-1">
              <h2 className="text-base text-portal-800">Tugas Hari Ini</h2>
              <Link href={to("tugas")} prefetch={false} className="text-portal-800">
                Selengkapnya
              </Link>
            </div>
            {dueTasks.length === 0 ? (
              <p className="rounded-2xl border border-zinc-300 bg-white px-4 py-4 text-portal-800">
                Tidak ada tugas hari ini
              </p>
            ) : (
              <ul className="space-y-2">
                {dueTasks.map((t) => (
                  <li key={t.id} className="rounded-2xl bg-white px-4 py-3 text-zinc-700">
                    {t.title}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between px-1">
              <h2 className="text-base font-bold text-portal-800">Jadwal Standar</h2>
              <Link href={to("jadwal")} prefetch={false} className="font-bold text-portal-800">
                Lihat Semua
              </Link>
            </div>
            <ScheduleTimeline days={schedule} today={today} />
          </section>
        </main>
      </div>
    );
  }

  // ───────────────────────── Lainnya ─────────────────────────
  if (page === "lainnya") {
    const tiles: { page: Page; extra?: string; icon: LucideIcon; accent?: LucideIcon; label: string }[] = [
      { page: "kehadiran", icon: House, accent: UserCheck, label: "Kehadiran" },
      { page: "cuti", icon: UserRound, accent: Check, label: "Cuti" },
      { page: "lembur", icon: AlarmClock, accent: Moon, label: "Lembur" },
      { page: "gaji", icon: Wallet, label: "Gaji" },
      { page: "surat", extra: "&t=sp", icon: Mail, accent: TriangleAlert, label: "Surat Peringatan" },
      { page: "surat", extra: "&t=sk", icon: Mail, accent: Info, label: "Surat Keterangan" },
      { page: "kegiatan", icon: IdCard, label: "Kegiatan Karyawan" },
      { page: "tugas", icon: ClipboardList, accent: Check, label: "Penugasan" },
      { page: "reimburse", icon: Receipt, accent: Coins, label: "Reimburse" },
      { page: "jadwal", icon: CalendarDays, accent: Clock, label: "Jadwal Kerja" },
      { page: "profil", icon: UserRound, accent: IdCard, label: "Profil Saya" },
    ];
    return (
      <div className={shell}>
        <PortalHeader title="Lainnya" backHref={base} />
        <main className="mx-auto max-w-md px-4 pt-6">
          <div className="grid grid-cols-3 gap-x-3 gap-y-6">
            {tiles.map((t) => (
              <MenuTile key={t.label} href={to(t.page, t.extra)} icon={t.icon} accent={t.accent} label={t.label} />
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ───────────────────────── Jadwal ─────────────────────────
  if (page === "jadwal") {
    const schedule = await loadSchedule(supabase, business.id, employee.id, today, 14);
    return (
      <div className={shell}>
        <PortalHeader title="Jadwal Kerja" backHref={base} />
        <main className="mx-auto max-w-md px-4 pt-5">
          <ScheduleTimeline days={schedule} today={today} />
        </main>
      </div>
    );
  }

  // ───────────────────────── Profil ─────────────────────────
  if (page === "profil") {
    const { data: profile } = await supabase
      .from("employees")
      .select("nik, join_date, bank_name, bank_account_number, bank_account_name")
      .eq("id", employee.id)
      .eq("business_id", business.id)
      .maybeSingle();
    const rows: { label: string; value: string | null }[] = [
      {
        label: "Tanggal masuk kerja",
        value: profile?.join_date ? fmtDate(profile.join_date, { day: "numeric", month: "long", year: "numeric" }) : null,
      },
      { label: "Masa kerja", value: profile?.join_date ? tenureLabel(profile.join_date) : null },
      { label: "NIK", value: profile?.nik ? maskNik(profile.nik) : null },
      { label: "Bank / e-wallet", value: profile?.bank_name ?? null },
      {
        label: "No. rekening",
        value: profile?.bank_account_number ? maskAccountNumber(profile.bank_account_number) : null,
      },
      { label: "Atas nama rekening", value: profile?.bank_account_name ?? null },
    ];
    return (
      <div className={shell}>
        <PortalHeader title="Profil Saya" backHref={base} />
        <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
          <PortalCard className="flex items-center gap-4 !p-5">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-portal-700 bg-zinc-200 text-2xl font-bold text-zinc-500">
              {employee.name.charAt(0).toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate font-bold text-zinc-700">{employee.name}</p>
              {employee.note && <p className="truncate text-sm italic text-zinc-600">{employee.note}</p>}
              <p className="truncate text-xs text-zinc-500">{business.name}</p>
            </div>
          </PortalCard>
          <PortalCard>
            <dl className="divide-y divide-zinc-100">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start justify-between gap-4 py-3 text-sm">
                  <dt className="text-zinc-500">{r.label}</dt>
                  <dd className={`text-right font-medium ${r.value ? "text-zinc-800" : "text-zinc-400"}`}>
                    {r.value ?? "Belum diisi"}
                  </dd>
                </div>
              ))}
            </dl>
          </PortalCard>
          <p className="px-2 text-center text-xs text-zinc-500">
            NIK dan nomor rekening disamarkan demi keamanan. Data salah atau berubah? Hubungi admin.
          </p>
        </main>
      </div>
    );
  }

  // ───────────────────────── Kehadiran ─────────────────────────
  if (page === "kehadiran") {
    const options = monthOptions(today);
    const selected = options.some((o) => o.value === sp.m) ? (sp.m as string) : options[0].value;
    const range = monthRange(`${selected}-01`);
    const [{ summary }, { data: rows }] = await Promise.all([
      loadAttendanceSummary(supabase, business.id, employee.id, range.start, range.end),
      supabase
        .from("attendance")
        .select("date, status, note, late, late_minutes, overtime_hours, check_in_at, check_out_at, verified_by_admin")
        .eq("business_id", business.id)
        .eq("employee_id", employee.id)
        .gte("date", range.start)
        .lte("date", range.end)
        .order("date", { ascending: false }),
    ]);
    const lateCount = summary.lateMinutesList.length;
    const izinTotal = summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend + summary.sakit;
    return (
      <div className={shell}>
        <PortalHeader title="Kehadiran" backHref={to("lainnya")} />
        <main className="mx-auto max-w-md space-y-3 px-4 pt-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard value={Math.max(0, summary.hadir - lateCount)} label="Tepat Waktu" className="bg-[#8db9e3]" />
            <StatCard value={summary.alpa} label="Tidak Hadir" className="bg-[#4f80ad]" />
            <StatCard value={lateCount} label="Terlambat" className="bg-[#4a6f9a]" />
            <StatCard value={izinTotal} label="Izin / Sakit" className="bg-[#1f5683]" />
          </div>
          <MonthSelect slug={slug} page="kehadiran" value={selected} options={options} />
          {(rows ?? []).length === 0 ? (
            <PortalEmpty />
          ) : (
            <PortalCard>
              <AttendanceHistory rows={rows ?? []} />
            </PortalCard>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Cuti ─────────────────────────
  if (page === "cuti") {
    const year = today.slice(0, 4);
    const [{ data: leaveTypes }, { data: approvedLeaves }, { data: requests }] = await Promise.all([
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
        .from("leave_requests")
        .select("id, start_date, end_date, days_count, status, reviewed_note, leave_types(name)")
        .eq("business_id", business.id)
        .eq("employee_id", employee.id)
        .order("start_date", { ascending: false })
        .limit(15),
    ]);
    const used = new Map<string, number>();
    for (const l of approvedLeaves ?? []) used.set(l.leave_type_id, (used.get(l.leave_type_id) ?? 0) + l.days_count);

    return (
      <div className={shell}>
        <PortalHeader
          title="Cuti"
          backHref={base}
          plusHref={business.leave_request_slug ? `/cuti/${business.leave_request_slug}` : undefined}
        />
        <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
          <div className="overflow-hidden rounded-xl border border-zinc-300 bg-white">
            <div className="grid grid-cols-3 bg-portal-500 px-3 py-3 text-center text-white">
              <span>Jenis Cuti</span>
              <span>Kuota Cuti</span>
              <span>Terpakai</span>
            </div>
            {(leaveTypes ?? []).length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-zinc-500">Belum ada jenis cuti.</p>
            ) : (
              <ul className="divide-y divide-zinc-100">
                {(leaveTypes ?? []).map((lt) => (
                  <li key={lt.id} className="grid grid-cols-3 px-3 py-3 text-center text-zinc-700">
                    <span className="truncate">{lt.name}</span>
                    <span>{Number(lt.default_days_per_year)} hari</span>
                    <span>{used.get(lt.id) ?? 0} hari</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {(requests ?? []).length === 0 ? (
            <PortalEmpty />
          ) : (
            <PortalCard>
              <ul className="divide-y divide-zinc-100">
                {(requests ?? []).map((r) => {
                  const status = OVERTIME_STATUS[r.status] ?? OVERTIME_STATUS.pending;
                  return (
                    <li key={r.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-800">
                          {(r.leave_types as unknown as { name: string } | null)?.name ?? "Cuti"} · {r.days_count} hari
                        </p>
                        <p className="text-xs text-zinc-500">
                          {fmtDate(r.start_date, { day: "numeric", month: "short" })} –{" "}
                          {fmtDate(r.end_date, { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        {r.status === "rejected" && r.reviewed_note && (
                          <p className="text-xs text-red-500">Alasan: {r.reviewed_note}</p>
                        )}
                      </div>
                      <Badge tone={status.tone}>{status.label}</Badge>
                    </li>
                  );
                })}
              </ul>
            </PortalCard>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Lembur ─────────────────────────
  if (page === "lembur") {
    const month = monthRange(today);
    const [{ overtimeHoursTotal }, { data: requests }] = await Promise.all([
      loadAttendanceSummary(supabase, business.id, employee.id, month.start, month.end),
      business.overtime_approval_required
        ? supabase
            .from("overtime_requests")
            .select("id, date, hours, reason, status, reviewed_note")
            .eq("business_id", business.id)
            .eq("employee_id", employee.id)
            .order("date", { ascending: false })
            .limit(15)
        : Promise.resolve({ data: [] as { id: string; date: string; hours: number; reason: string | null; status: string; reviewed_note: string | null }[] }),
    ]);

    if (isNew && business.overtime_approval_required) {
      return (
        <div className={shell}>
          <PortalHeader title="Pengajuan Lembur" backHref={to("lembur")} />
          <main className="mx-auto max-w-md px-4 pt-4">
            <OvertimeRequestForm slug={slug} today={today} />
          </main>
        </div>
      );
    }
    return (
      <div className={shell}>
        <PortalHeader
          title="Lembur"
          backHref={base}
          plusHref={business.overtime_approval_required ? to("lembur", "&new=1") : undefined}
        />
        <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
          <PortalCard className="!py-6 text-center">
            <p className="text-base text-zinc-600">Total Jam Lembur Bulan Ini</p>
            <p className="mt-2 text-xl font-bold text-portal-500">
              {overtimeHoursTotal.toLocaleString("id-ID")} Jam
            </p>
          </PortalCard>
          {(requests ?? []).length === 0 ? (
            <PortalEmpty />
          ) : (
            <PortalCard>
              <ul className="divide-y divide-zinc-100">
                {(requests ?? []).map((o) => {
                  const status = OVERTIME_STATUS[o.status] ?? OVERTIME_STATUS.pending;
                  return (
                    <li key={o.id} className="flex items-start justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-zinc-800">
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
            </PortalCard>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Gaji ─────────────────────────
  if (page === "gaji") {
    const tab = sp.t === "kasbon" || sp.t === "pinjaman" ? sp.t : "gaji";
    const [{ data: payslips }, ledgers] = await Promise.all([
      supabase
        .from("payslips")
        .select(
          "id, period_start, period_end, paid_at, base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount",
        )
        .eq("business_id", business.id)
        .eq("employee_id", employee.id)
        .order("period_start", { ascending: false })
        .limit(12),
      loadEmployeeLedgers(supabase, business.id, employee.id),
    ]);
    const ids = (payslips ?? []).map((p) => p.id);
    const { data: adjustments } = ids.length
      ? await supabase.from("payslip_adjustments").select("payslip_id, type, amount").in("payslip_id", ids)
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

    return (
      <div className={shell}>
        <PortalHeader
          title="Gaji"
          backHref={base}
          tabs={[
            { href: to("gaji"), label: "Gaji", active: tab === "gaji" },
            { href: to("gaji", "&t=kasbon"), label: "Kasbon", active: tab === "kasbon" },
            { href: to("gaji", "&t=pinjaman"), label: "Pinjaman", active: tab === "pinjaman" },
          ]}
        />
        <main className="mx-auto max-w-md space-y-4 px-4 pt-4">
          {tab === "gaji" &&
            (slips.length === 0 ? (
              <p className="py-10 text-center text-zinc-800">Data gaji tidak ditemukan!</p>
            ) : (
              <PortalCard>
                <ul className="-mx-2">
                  {slips.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/karyawan/${slug}/slip/${p.id}`}
                        prefetch={false}
                        className="flex items-center gap-3 rounded-2xl px-2 py-3 hover:bg-zinc-50"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-portal-100 text-portal-700">
                          <Receipt className="h-5 w-5" aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-zinc-900">{fmtPeriod(p.period_start, p.period_end)}</p>
                          <p className={`text-[11px] ${p.paid_at ? "text-emerald-600" : "text-amber-600"}`}>
                            {p.paid_at ? "Sudah dibayar" : "Belum dibayar"}
                          </p>
                        </div>
                        <span className="font-bold tabular-nums text-zinc-900">{fmtRupiah(p.total)}</span>
                        <ChevronRight className="h-4 w-4 shrink-0 text-zinc-300" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </PortalCard>
            ))}
          {tab === "kasbon" &&
            (ledgers.kasbon.entries.length === 0 ? (
              <p className="py-10 text-center text-zinc-800">Data kasbon tidak ditemukan!</p>
            ) : (
              <LedgerCard title="Kasbon" icon={HandCoins} ledger={ledgers.kasbon} />
            ))}
          {tab === "pinjaman" &&
            (ledgers.personalLoan.entries.length === 0 ? (
              <p className="py-10 text-center text-zinc-800">Data pinjaman tidak ditemukan!</p>
            ) : (
              <LedgerCard title="Pinjaman Pribadi" icon={Landmark} ledger={ledgers.personalLoan} />
            ))}
        </main>
      </div>
    );
  }

  // ───────────────────────── Surat ─────────────────────────
  if (page === "surat") {
    const tab = sp.t === "sk" ? "sk" : "sp";
    const { data: letters } = await supabase
      .from("employee_letters")
      .select("id, kind, letter_number, issued_date, subject, body")
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .in("kind", tab === "sk" ? ["sk"] : ["sp1", "sp2", "sp3"])
      .order("issued_date", { ascending: false })
      .limit(30);
    return (
      <div className={shell}>
        <PortalHeader
          title={tab === "sk" ? "Surat Keterangan" : "Surat Peringatan"}
          backHref={to("lainnya")}
          tabs={[
            { href: to("surat", "&t=sp"), label: "Surat Peringatan", active: tab === "sp" },
            { href: to("surat", "&t=sk"), label: "Surat Keterangan", active: tab === "sk" },
          ]}
        />
        <main className="mx-auto max-w-md px-4 pt-4">
          {(letters ?? []).length === 0 ? (
            <PortalEmpty />
          ) : (
            <ul className="space-y-3">
              {(letters ?? []).map((l) => (
                <li key={l.id}>
                  <PortalCard>
                    <details>
                      <summary className="cursor-pointer list-none">
                        <p className="font-bold text-portal-800">{isLetterKind(l.kind) ? LETTER_KINDS[l.kind] : l.kind}</p>
                        <p className="text-sm text-zinc-500">
                          {fmtDate(l.issued_date)} · {l.letter_number}
                        </p>
                      </summary>
                      <p className="mt-1 font-medium text-zinc-800">{l.subject}</p>
                      <p className="mt-2 whitespace-pre-wrap rounded-xl bg-portal-50 p-3 text-sm text-zinc-700">{l.body}</p>
                    </details>
                  </PortalCard>
                </li>
              ))}
            </ul>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Kegiatan ─────────────────────────
  if (page === "kegiatan") {
    if (isNew) {
      return (
        <div className={shell}>
          <PortalHeader title="Lapor Kegiatan" backHref={to("kegiatan")} />
          <main className="mx-auto max-w-md px-4 pt-4">
            <ActivityForm slug={slug} today={today} />
          </main>
        </div>
      );
    }
    const options = monthOptions(today);
    const selected = options.some((o) => o.value === sp.m) ? (sp.m as string) : options[0].value;
    const range = monthRange(`${selected}-01`);
    const { data: activities } = await supabase
      .from("employee_activities")
      .select("id, date, title, description")
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .gte("date", range.start)
      .lte("date", range.end)
      .order("date", { ascending: false })
      .order("created_at", { ascending: false });
    return (
      <div className={shell}>
        <PortalHeader title="Kegiatan Karyawan" backHref={to("lainnya")} plusHref={to("kegiatan", "&new=1")} />
        <main className="mx-auto max-w-md space-y-3 px-4 pt-4">
          <MonthSelect slug={slug} page="kegiatan" value={selected} options={options} />
          {(activities ?? []).length === 0 ? (
            <PortalEmpty />
          ) : (
            <PortalCard>
              <ul className="divide-y divide-zinc-100">
                {(activities ?? []).map((a) => (
                  <li key={a.id} className="py-3">
                    <p className="font-medium text-zinc-800">{a.title}</p>
                    <p className="text-xs text-zinc-500">
                      {fmtDate(a.date, { weekday: "short", day: "numeric", month: "short" })}
                      {a.description ? ` · ${a.description}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            </PortalCard>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Penugasan ─────────────────────────
  if (page === "tugas") {
    const { data: tasks } = await supabase
      .from("employee_tasks")
      .select("id, title, description, due_date, status")
      .eq("business_id", business.id)
      .eq("employee_id", employee.id)
      .order("created_at", { ascending: false })
      .limit(50);
    const list = (tasks ?? []).map((t) => ({ ...t, status: asTaskStatus(t.status) }));
    const count = (s: TaskStatus) => list.filter((t) => t.status === s).length;
    return (
      <div className={shell}>
        <PortalHeader title="Penugasan" backHref={base} />
        <main className="mx-auto max-w-md space-y-3 px-4 pt-4">
          <div className="grid grid-cols-3 gap-3">
            <StatCard value={count("todo")} label="Baru" className="bg-[#8db9e3]" />
            <StatCard value={count("in_progress")} label="Berlangsung" className="bg-[#4f80ad]" />
            <StatCard value={count("done")} label="Selesai" className="bg-[#4a6f9a]" />
          </div>
          {list.length === 0 ? (
            <PortalEmpty />
          ) : (
            <PortalCard>
              <ul className="divide-y divide-zinc-100">
                {list.map((t) => (
                  <li key={t.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className={`font-medium ${t.status === "done" ? "text-zinc-400 line-through" : "text-zinc-800"}`}>
                        {t.title}
                      </p>
                      {t.description && <p className="text-xs text-zinc-500">{t.description}</p>}
                      {t.due_date && (
                        <p
                          className={`text-xs ${t.status !== "done" && t.due_date < today ? "font-semibold text-red-500" : "text-zinc-400"}`}
                        >
                          Tenggat {fmtDate(t.due_date, { day: "numeric", month: "short" })}
                        </p>
                      )}
                    </div>
                    <TaskStatusSelect slug={slug} taskId={t.id} status={t.status} />
                  </li>
                ))}
              </ul>
            </PortalCard>
          )}
        </main>
      </div>
    );
  }

  // ───────────────────────── Reimburse ─────────────────────────
  if (isNew) {
    return (
      <div className={shell}>
        <PortalHeader title="Pengajuan Reimburse" backHref={to("reimburse")} />
        <main className="mx-auto max-w-md px-4 pt-4">
          <ReimbursementForm slug={slug} today={today} />
        </main>
      </div>
    );
  }
  const { data: claims } = await supabase
    .from("reimbursements")
    .select("id, date, category, amount, description, status, reviewed_note, payslip_id")
    .eq("business_id", business.id)
    .eq("employee_id", employee.id)
    .order("date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);
  return (
    <div className={shell}>
      <PortalHeader title="Reimburse" backHref={to("lainnya")} plusHref={to("reimburse", "&new=1")} />
      <main className="mx-auto max-w-md px-4 pt-4">
        {(claims ?? []).length === 0 ? (
          <PortalEmpty />
        ) : (
          <PortalCard>
            <ul className="divide-y divide-zinc-100">
              {(claims ?? []).map((c) => {
                const status =
                  c.status === "rejected"
                    ? { label: "Ditolak", tone: "red" as const }
                    : c.status === "approved"
                      ? { label: c.payslip_id ? "Masuk slip" : "Disetujui", tone: "green" as const }
                      : { label: "Menunggu", tone: "amber" as const };
                return (
                  <li key={c.id} className="flex items-start justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-800">
                        {fmtRupiah(Number(c.amount))} · {reimbursementCategoryLabel(c.category)}
                      </p>
                      <p className="truncate text-xs text-zinc-500">
                        {fmtDate(c.date, { day: "numeric", month: "short" })}
                        {c.description ? ` · ${c.description}` : ""}
                      </p>
                      {c.status === "rejected" && c.reviewed_note && (
                        <p className="text-xs text-red-500">Alasan: {c.reviewed_note}</p>
                      )}
                    </div>
                    <Badge tone={status.tone}>{status.label}</Badge>
                  </li>
                );
              })}
            </ul>
          </PortalCard>
        )}
      </main>
    </div>
  );
}
