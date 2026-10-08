import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signSelfieUrls } from "@/lib/attendance/selfie";
import AttendanceRow, { type AttendanceRowData } from "./attendance-row";
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

export default async function AttendancePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { businessId } = await params;
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayWib();

  const supabase = await createClient();

  const [{ data: employees }, { data: attendanceRows }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, note")
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
  ]);

  const attendanceByEmployee = new Map((attendanceRows ?? []).map((a) => [a.employee_id, a]));
  const selfieUrls = await signSelfieUrls(
    supabase,
    (attendanceRows ?? []).map((a) => a.check_in_photo_url),
  );

  const rows: AttendanceRowData[] = (employees ?? []).map((e) => {
    const a = attendanceByEmployee.get(e.id);
    return {
      employeeId: e.id,
      employeeName: e.name,
      employeeNote: e.note,
      attendanceId: a?.id ?? null,
      status: (a?.status as AttendanceStatus | undefined) ?? null,
      note: a?.note ?? null,
      late: a?.late ?? false,
      lateMinutes: a?.late_minutes ?? 0,
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

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Absensi</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {rows.length} karyawan aktif · Hadir {summary.hadir ?? 0} · Izin {summary.izin ?? 0} ·
            Sakit {summary.sakit ?? 0} · Alpa {summary.alpa ?? 0}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/business/${businessId}/attendance/rekap`}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Rekap Bulanan
          </Link>
          <Link
            href={`?date=${shiftDate(date, -1)}`}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            ← Kemarin
          </Link>
          <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
            {date}
          </span>
          <Link
            href={`?date=${shiftDate(date, 1)}`}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
          >
            Besok →
          </Link>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {rows.map((row) => (
              <AttendanceRow key={row.employeeId} businessId={businessId} date={date} row={row} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
