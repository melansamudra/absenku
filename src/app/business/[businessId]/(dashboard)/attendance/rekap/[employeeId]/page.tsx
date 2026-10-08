import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signSelfieUrls } from "@/lib/attendance/selfie";
import { countDaysInclusive, loadAttendanceSummary } from "@/lib/payroll/aggregate";

function currentMonthRange() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const [y, m] = today.split("-");
  const start = `${y}-${m}-01`;
  const lastDay = new Date(Number(y), Number(m), 0).getDate();
  const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  hadir: { label: "Hadir", className: "bg-emerald-50 text-emerald-700" },
  izin: { label: "Izin", className: "bg-amber-50 text-amber-700" },
  sakit: { label: "Sakit", className: "bg-sky-50 text-sky-700" },
  alpa: { label: "Alpa", className: "bg-red-50 text-red-700" },
  off: { label: "Off", className: "bg-zinc-100 text-zinc-500" },
};

function fmtTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AttendanceRekapDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string; employeeId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { businessId, employeeId } = await params;
  const { start: startParam, end: endParam } = await searchParams;
  const defaultRange = currentMonthRange();
  const periodStart = startParam || defaultRange.start;
  const periodEnd = endParam || defaultRange.end;

  const supabase = await createClient();

  const [{ data: employee }, { data: attendanceRows }, { summary }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, note")
      .eq("id", employeeId)
      .eq("business_id", businessId)
      .single(),
    supabase
      .from("attendance")
      .select("date, status, note, late, late_minutes, check_in_at, check_out_at, check_in_photo_url, overtime_hours")
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .gte("date", periodStart)
      .lte("date", periodEnd)
      .order("date", { ascending: true }),
    loadAttendanceSummary(supabase, businessId, employeeId, periodStart, periodEnd),
  ]);

  if (!employee) notFound();

  const rowsByDate = new Map((attendanceRows ?? []).map((r) => [r.date, r]));
  const selfieUrls = await signSelfieUrls(
    supabase,
    (attendanceRows ?? []).map((r) => r.check_in_photo_url),
  );

  const days: string[] = [];
  {
    const [sy, sm, sd] = periodStart.split("-").map(Number);
    const count = countDaysInclusive(periodStart, periodEnd);
    for (let i = 0; i < count; i++) {
      const dt = new Date(Date.UTC(sy, sm - 1, sd));
      dt.setUTCDate(dt.getUTCDate() + i);
      days.push(dt.toISOString().slice(0, 10));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Link
            href={`/business/${businessId}/attendance/rekap?start=${periodStart}&end=${periodEnd}`}
            className="mb-1 inline-block text-xs font-medium text-brand-600 hover:underline"
          >
            ← Kembali ke Rekap
          </Link>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">{employee.name}</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            {employee.note ? `${employee.note} · ` : ""}
            {periodStart} — {periodEnd}
          </p>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {[
          { label: "Hadir", value: summary.hadir, className: "text-emerald-600" },
          {
            label: "Izin",
            value: summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend,
            className: "text-amber-600",
          },
          { label: "Sakit", value: summary.sakit, className: "text-sky-600" },
          { label: "Alpa", value: summary.alpa, className: "text-red-500" },
          { label: "Off", value: summary.off, className: "text-zinc-400" },
          { label: "Telat", value: summary.lateMinutesList.length, className: "text-orange-500" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-zinc-100 bg-white p-3 text-center shadow-sm">
            <p className={`text-xl font-bold ${s.className}`}>{s.value}</p>
            <p className="text-[11px] text-zinc-400">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
        <div className="divide-y divide-zinc-100">
          {days.map((date) => {
            const row = rowsByDate.get(date);
            const status = row ? STATUS_LABEL[row.status] : null;
            return (
              <div key={date} className="flex items-center justify-between px-5 py-2.5 text-sm">
                <span className="w-28 shrink-0 text-zinc-500">{date}</span>
                {status ? (
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.className}`}>
                    {status.label}
                  </span>
                ) : (
                  <span className="text-xs text-zinc-300">— belum diisi —</span>
                )}
                <span className="flex-1 px-3 text-right text-xs text-zinc-400">
                  {row?.note && <span>{row.note} · </span>}
                  {row?.late && <span className="text-orange-500">Telat {row.late_minutes}m · </span>}
                  {(row?.check_in_at || row?.check_out_at) && (
                    <span>
                      🤳 {fmtTime(row.check_in_at)} → {fmtTime(row.check_out_at) ?? "—"}
                    </span>
                  )}
                  {row?.check_in_photo_url && selfieUrls.has(row.check_in_photo_url) && (
                    <>
                      {" "}
                      <a
                        href={selfieUrls.get(row.check_in_photo_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-600 hover:underline"
                      >
                        Lihat foto
                      </a>
                    </>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
