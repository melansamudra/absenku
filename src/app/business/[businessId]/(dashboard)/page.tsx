import Link from "next/link";
import { Banknote, CalendarCheck, FileText, Megaphone, QrCode, Users, UserCheck, UserMinus, UserRoundX, UsersRound, type LucideIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { loadPendingCounts } from "@/lib/dashboard/pending";
import { computeDemographics } from "@/lib/dashboard/demographics";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { DistributionCard, MonthCalendar } from "./dashboard-widgets";

function todayWib() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export default async function BusinessOverviewPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const today = todayWib();

  const [{ data: employees }, { data: attendanceToday }, pending] = await Promise.all([
    supabase
      .from("employees")
      .select(
        "id, name, active, birth_date, gender, marital_status, religion, edu_level, join_date, employment_status, organizations(name)",
      )
      .eq("business_id", businessId)
      .is("deleted_at", null),
    supabase
      .from("attendance")
      .select("status")
      .eq("business_id", businessId)
      .eq("date", today),
    loadPendingCounts(supabase, businessId),
  ]);

  const activeCount = (employees ?? []).filter((e) => e.active).length;
  const totalCount = (employees ?? []).length;

  const statusCounts: Record<string, number> = {};
  for (const row of attendanceToday ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }
  const belumAbsen = Math.max(0, activeCount - (attendanceToday?.length ?? 0));

  // ── Statistik: demografi, gaji bulan ini, dan kalender ──────────────────
  const [yearStr, monthStr, dayStr] = today.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const monthStart = `${yearStr}-${monthStr}-01`;
  const monthEnd = `${yearStr}-${monthStr}-${String(new Date(Date.UTC(year, month, 0)).getUTCDate()).padStart(2, "0")}`;
  const prev = new Date(Date.UTC(year, month - 2, 1));
  const prevStart = prev.toISOString().slice(0, 10);
  const prevEnd = new Date(Date.UTC(year, month - 1, 0)).toISOString().slice(0, 10);

  const slipFields =
    "base_pay, meal_allowance, attendance_allowance, lembur_amount, thr_amount, izin_deduction, late_deduction, kasbon_deduction, personal_loan_deduction, pph21_amount, bpjs_employee_amount, payslip_adjustments(type, amount)";
  const [{ data: holidays }, { data: leaves }, { data: slipsNow }, { data: slipsPrev }] = await Promise.all([
    supabase.from("payroll_holidays").select("holiday_date, label").eq("business_id", businessId).gte("holiday_date", monthStart).lte("holiday_date", monthEnd),
    supabase
      .from("leave_requests")
      .select("start_date, end_date, employees(name)")
      .eq("business_id", businessId)
      .eq("status", "approved")
      .lte("start_date", monthEnd)
      .gte("end_date", monthStart),
    supabase.from("payslips").select(slipFields).eq("business_id", businessId).gte("period_start", monthStart).lte("period_start", monthEnd),
    supabase.from("payslips").select(slipFields).eq("business_id", businessId).gte("period_start", prevStart).lte("period_start", prevEnd),
  ]);

  const slipNet = (rows: typeof slipsNow) =>
    (rows ?? []).map((p) =>
      payslipTotal(
        p,
        ((p.payslip_adjustments ?? []) as { type: "tunjangan" | "potongan"; amount: number }[]).map((a) => ({ type: a.type, amount: Number(a.amount) })),
      ),
    );
  const netNow = slipNet(slipsNow);
  const netPrev = slipNet(slipsPrev);
  const totalNow = netNow.reduce((t, v) => t + v, 0);
  const totalPrev = netPrev.reduce((t, v) => t + v, 0);
  const avgNow = netNow.length ? totalNow / netNow.length : 0;
  const delta = totalPrev > 0 ? Math.round(((totalNow - totalPrev) / totalPrev) * 100) : null;

  const activeEmployees = (employees ?? []).filter((e) => e.active);
  const demo = computeDemographics(activeEmployees as unknown as Parameters<typeof computeDemographics>[0]);

  const marks = { holidays: {} as Record<number, string>, birthdays: {} as Record<number, string[]>, leaves: {} as Record<number, string[]> };
  for (const h of holidays ?? []) marks.holidays[Number(h.holiday_date.slice(8, 10))] = h.label ?? "Libur";
  for (const e of activeEmployees) {
    if (e.birth_date && Number(e.birth_date.slice(5, 7)) === month) {
      (marks.birthdays[Number(e.birth_date.slice(8, 10))] ??= []).push(e.name);
    }
  }
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (const l of leaves ?? []) {
    const name = (l.employees as unknown as { name: string } | null)?.name ?? "—";
    const from = l.start_date < monthStart ? 1 : Number(l.start_date.slice(8, 10));
    const to = l.end_date > monthEnd ? daysInMonth : Number(l.end_date.slice(8, 10));
    for (let d = from; d <= to; d++) (marks.leaves[d] ??= []).push(name);
  }
  const rupiah = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;

  const pendingItems = [
    { label: "Cuti", count: pending.cuti, href: "leave-requests" },
    { label: "Lembur", count: pending.lembur, href: "overtime" },
    { label: "Reimbursement", count: pending.reimbursements, href: "reimbursements" },
  ];
  const pendingTotal = pendingItems.reduce((sum, i) => sum + i.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Beranda</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Absensi hari ini, {today}</p>
      </div>

      <div
        className={`mb-6 rounded-xl border p-4 shadow-sm ${
          pendingTotal > 0 ? "border-amber-200 bg-amber-50" : "border-zinc-100 bg-white"
        }`}
      >
        <h2 className="text-sm font-semibold text-zinc-800">
          Menunggu persetujuan{pendingTotal > 0 ? ` (${pendingTotal})` : ""}
        </h2>
        {pendingTotal === 0 ? (
          <p className="mt-1 text-xs text-zinc-500">Tidak ada pengajuan yang menunggu. Semua sudah diproses.</p>
        ) : (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {pendingItems.map((i) => (
              <Link
                key={i.href}
                href={`/business/${businessId}/${i.href}`}
                className={`rounded-lg border px-3 py-2 text-center ${
                  i.count > 0
                    ? "border-amber-300 bg-white hover:bg-amber-100"
                    : "border-transparent bg-white/60 text-zinc-400"
                }`}
              >
                <p className={`text-xl font-bold ${i.count > 0 ? "text-amber-700" : "text-zinc-300"}`}>{i.count}</p>
                <p className="text-[12px] font-medium text-zinc-600">{i.label}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat icon={UsersRound} tone="indigo" label="Karyawan Aktif" value={activeCount} note={`dari ${totalCount} total`} />
        <Stat icon={UserCheck} tone="emerald" label="Hadir" value={statusCounts.hadir ?? 0} />
        <Stat icon={UserMinus} tone="amber" label="Izin/Sakit" value={(statusCounts.izin ?? 0) + (statusCounts.sakit ?? 0)} />
        <Stat icon={UserRoundX} tone="zinc" label="Belum Absen" value={belumAbsen} />
      </div>

      <h2 className="mb-3 text-sm font-semibold text-zinc-800">Akses Cepat</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <Shortcut href={`/business/${businessId}/employees`} icon={Users} title="Karyawan" desc="Data karyawan & tarif gaji" />
        <Shortcut href={`/business/${businessId}/attendance`} icon={CalendarCheck} title="Absensi" desc="Tandai kehadiran atau cek rekap" />
        <Shortcut href={`/business/${businessId}/payroll`} icon={Banknote} title="Payroll" desc="Buat & kelola slip gaji" />
        <Shortcut href={`/business/${businessId}/payroll/laporan`} icon={FileText} title="Laporan Gaji" desc="Total transfer & rekening per bulan" />
        <Shortcut href={`/business/${businessId}/announcements`} icon={Megaphone} title="Papan Informasi" desc="Pengumuman untuk karyawan" />
        <Shortcut href={`/business/${businessId}/settings/general`} icon={QrCode} title="Link Portal Karyawan" desc="Satu link untuk absen, slip, dan cuti" />
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-800">Gaji Bulan Ini</h2>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Total Gaji Bersih</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{rupiah(totalNow)}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            {netNow.length} slip
            {delta !== null && <span className={delta >= 0 ? " text-emerald-600" : " text-red-600"}> · {delta >= 0 ? "▲" : "▼"} {Math.abs(delta)}% dari bulan lalu</span>}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-zinc-500">Rata-rata Gaji</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{rupiah(avgNow)}</p>
          <p className="mt-0.5 text-xs text-zinc-400">per slip bulan ini</p>
        </div>
        <Link href={`/business/${businessId}/payroll`} className="flex items-center justify-between rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40">
          <span>
            <span className="block text-xs font-medium text-zinc-500">Belum ada slip bulan ini?</span>
            <span className="mt-2 block text-sm font-semibold text-brand-700">Generate Payroll →</span>
          </span>
          <Banknote className="h-8 w-8 text-brand-300" aria-hidden="true" />
        </Link>
      </div>

      <h2 className="mb-3 mt-8 text-sm font-semibold text-zinc-800">Statistik Karyawan</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <DistributionCard title="Usia" data={demo.usia} />
        <DistributionCard title="Pendidikan" data={demo.pendidikan} />
        <DistributionCard title="Status Perkawinan" data={demo.statusPerkawinan} />
        <DistributionCard title="Lama Kerja" data={demo.lamaKerja} />
        <DistributionCard title="Jenis Kelamin" data={demo.jenisKelamin} />
        <DistributionCard title="Agama" data={demo.agama} />
        <DistributionCard title="Karyawan per Organisasi" data={demo.organisasi} />
        <DistributionCard title="Karyawan berdasarkan Status" data={demo.statusKaryawan} />
        <MonthCalendar year={year} month={month} today={Number(dayStr)} marks={marks} />
      </div>
    </div>
  );
}

const TONES = {
  indigo: "bg-brand-50 text-brand-600",
  emerald: "bg-emerald-50 text-emerald-600",
  amber: "bg-amber-50 text-amber-600",
  zinc: "bg-zinc-100 text-zinc-600",
} as const;

function Stat({ icon: Icon, tone, label, value, note }: { icon: LucideIcon; tone: keyof typeof TONES; label: string; value: number; note?: string }) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${TONES[tone]}`}>
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-2 text-2xl font-bold text-zinc-900">{value}</p>
      {note && <p className="mt-0.5 text-xs text-zinc-400">{note}</p>}
    </div>
  );
}

function Shortcut({ href, icon: Icon, title, desc }: { href: string; icon: LucideIcon; title: string; desc: string }) {
  return (
    <Link href={href} className="group flex items-start gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm transition-colors hover:border-brand-200 hover:bg-brand-50/40">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100">
        <Icon className="h-5 w-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-zinc-900">{title}</span>
        <span className="mt-0.5 block text-xs text-zinc-500">{desc}</span>
      </span>
    </Link>
  );
}
