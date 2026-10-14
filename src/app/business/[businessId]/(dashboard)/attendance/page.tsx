import Link from "next/link";
import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signSelfieUrls } from "@/lib/attendance/selfie";
import { Card, PageHeader, btnOutline } from "@/components/form-ui";
import AttendanceTable, { ExportButton, type AttendanceRowData } from "./attendance-table";
import type { AttendanceStatus } from "./actions";

function todayWib() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function shiftDate(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

function shiftMonth(dateStr: string, delta: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const last = new Date(Date.UTC(y, m + delta, 0)).getUTCDate();
  const dt = new Date(Date.UTC(y, m - 1 + delta, Math.min(d, last)));
  return dt.toISOString().slice(0, 10);
}

const DAY = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { businessId } = await params;
  const { date: dateParam } = await searchParams;
  const today = todayWib();
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : today;
  const base = `/business/${businessId}/attendance`;

  const supabase = await createClient();

  const [{ data: employees }, { data: attendanceRows }, { data: assignments }, { data: business }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, employee_code, note, positions(name), organizations(name)")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("attendance")
      .select(
        "id, employee_id, status, note, late, late_minutes, overtime_hours, check_in_at, check_out_at, check_in_photo_url, verified_by_admin",
      )
      .eq("business_id", businessId)
      .eq("date", date),
    supabase
      .from("employee_shift_assignments")
      .select("employee_id, shift_templates(name, start_time, end_time)")
      .eq("business_id", businessId)
      .eq("date", date),
    supabase.from("businesses").select("work_start_time, work_end_time").eq("id", businessId).single(),
  ]);

  // alasan terlambat (kolom baru, belum ada di tipe database -> query longgar; kolom belum dimigrasi = kosong)
  const { data: reasonRows } = await (supabase as unknown as { from: (t: string) => { select: (c: string) => { eq: (c: string, v: string) => { eq: (c: string, v: string) => PromiseLike<{ data: { employee_id: string; late_reason: string | null }[] | null }> } } } })
    .from("attendance")
    .select("employee_id, late_reason")
    .eq("business_id", businessId)
    .eq("date", date);
  const reasonByEmployee = new Map((reasonRows ?? []).map((r) => [r.employee_id, r.late_reason]));
  const attendanceByEmployee = new Map((attendanceRows ?? []).map((a) => [a.employee_id, a]));
  const shiftByEmployee = new Map(
    (assignments ?? []).map((a) => [
      a.employee_id,
      a.shift_templates
        ? `${a.shift_templates.name} (${a.shift_templates.start_time.slice(0, 5)}–${a.shift_templates.end_time.slice(0, 5)})`
        : null,
    ]),
  );
  const defaultShift = business
    ? `Reguler (${business.work_start_time.slice(0, 5)}–${business.work_end_time.slice(0, 5)})`
    : "Reguler";
  const selfieUrls = await signSelfieUrls(
    supabase,
    (attendanceRows ?? []).map((a) => a.check_in_photo_url),
  );

  const rows: AttendanceRowData[] = (employees ?? []).map((e) => {
    const a = attendanceByEmployee.get(e.id);
    return {
      employeeId: e.id,
      employeeName: e.name,
      employeeCode: e.employee_code,
      position: e.positions?.name ?? e.note,
      organization: e.organizations?.name ?? null,
      shift: shiftByEmployee.get(e.id) ?? defaultShift,
      attendanceId: a?.id ?? null,
      status: (a?.status as AttendanceStatus | undefined) ?? null,
      note: a?.note ?? null,
      late: a?.late ?? false,
      lateMinutes: a?.late_minutes ?? 0,
      lateReason: reasonByEmployee.get(e.id) ?? null,
      overtimeHours: Number(a?.overtime_hours ?? 0),
      checkInAt: a?.check_in_at ?? null,
      checkOutAt: a?.check_out_at ?? null,
      checkInPhotoUrl: a?.check_in_photo_url ? (selfieUrls.get(a.check_in_photo_url) ?? null) : null,
      verifiedByAdmin: a?.verified_by_admin ?? false,
    };
  });

  const summary = rows.reduce<Record<string, number>>((acc, r) => {
    if (r.status) acc[r.status] = (acc[r.status] ?? 0) + 1;
    return acc;
  }, {});

  // Date strip: semua hari di bulan yang dipilih.
  const [y, m] = date.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const monthDays = Array.from({ length: daysInMonth }, (_, i) => {
    const d = `${date.slice(0, 7)}-${String(i + 1).padStart(2, "0")}`;
    return { d, n: i + 1, dow: DAY[new Date(`${d}T00:00:00Z`).getUTCDay()] };
  });
  const monthLabel = new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div>
      <PageHeader
        title="Presensi"
        subtitle={`${rows.length} karyawan aktif · Hadir ${summary.hadir ?? 0} · Izin ${summary.izin ?? 0} · Sakit ${summary.sakit ?? 0} · Alpa ${summary.alpa ?? 0}`}
        actions={
          <>
            <ExportButton date={date} rows={rows} />
            <Link href={`/business/${businessId}/attendance/approval`} className={btnOutline}>
              Approval Presensi
            </Link>
            <Link href={`/business/${businessId}/settings`} className={btnOutline}>
              <Settings2 size={14} /> Atur Kebijakan Presensi
            </Link>
          </>
        }
      />

      <Card className="!p-0">
        <div className="flex gap-1 border-b border-zinc-100 p-3">
          <span className="rounded-lg border border-brand-500 bg-white px-4 py-1.5 text-[14px] font-semibold text-brand-700">Harian</span>
          <Link href={`${base}/rekap`} className="rounded-lg border border-zinc-200 bg-white px-4 py-1.5 text-[14px] text-zinc-600 hover:bg-zinc-50">
            Ringkasan
          </Link>
        </div>

        <div className="border-b border-zinc-100 p-3">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Link href={`${base}?date=${shiftMonth(date, -1)}`} className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50" aria-label="Bulan sebelumnya">
                <ChevronLeft size={15} />
              </Link>
              <span className="min-w-32 text-center text-[14px] font-semibold text-zinc-800">{monthLabel}</span>
              <Link href={`${base}?date=${shiftMonth(date, 1)}`} className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50" aria-label="Bulan berikutnya">
                <ChevronRight size={15} />
              </Link>
            </div>
            <div className="flex items-center gap-1.5">
              <Link href={`${base}?date=${shiftDate(date, -1)}`} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50">
                ← Kemarin
              </Link>
              <Link href={base} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50">
                Hari Ini
              </Link>
              <Link href={`${base}?date=${shiftDate(date, 1)}`} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs text-zinc-600 hover:bg-zinc-50">
                Besok →
              </Link>
            </div>
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {monthDays.map((day) => {
              const active = day.d === date;
              return (
                <Link
                  key={day.d}
                  href={`${base}?date=${day.d}`}
                  className={`flex w-12 shrink-0 flex-col items-center rounded-xl py-1.5 text-center transition-colors ${
                    active
                      ? "bg-brand-600 text-white"
                      : day.d === today
                        ? "bg-brand-100 text-brand-800"
                        : "bg-zinc-50 text-zinc-600 hover:bg-zinc-100"
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{day.dow}</span>
                  <span className="text-sm font-bold">{day.n}</span>
                </Link>
              );
            })}
          </div>
        </div>

        <AttendanceTable businessId={businessId} date={date} rows={rows} />
      </Card>
    </div>
  );
}
