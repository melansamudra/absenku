import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadAttendanceSummary } from "@/lib/payroll/aggregate";

function currentMonthRange() {
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const [y, m] = today.split("-");
  const start = `${y}-${m}-01`;
  const lastDay = new Date(Number(y), Number(m), 0).getDate();
  const end = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
}

export default async function AttendanceRekapPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ start?: string; end?: string }>;
}) {
  const { businessId } = await params;
  const { start: startParam, end: endParam } = await searchParams;
  const defaultRange = currentMonthRange();
  const periodStart = startParam || defaultRange.start;
  const periodEnd = endParam || defaultRange.end;

  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name, note")
    .eq("business_id", businessId)
    .eq("active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const rows = await Promise.all(
    (employees ?? []).map(async (e) => {
      const { summary } = await loadAttendanceSummary(
        supabase,
        businessId,
        e.id,
        periodStart,
        periodEnd,
      );
      return {
        employeeId: e.id,
        employeeName: e.name,
        employeeNote: e.note,
        hadir: summary.hadir,
        izin: summary.izinNoted + summary.izinUnnotedWeekday + summary.izinUnnotedWeekend,
        sakit: summary.sakit,
        alpa: summary.alpa,
        off: summary.off,
        telat: summary.lateMinutesList.length,
      };
    }),
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Rekap Absensi Bulanan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Ringkasan kehadiran per karyawan untuk periode terpilih.
        </p>
      </div>

      <form className="mb-5 flex flex-wrap items-end gap-3 rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Dari</label>
          <input
            type="date"
            name="start"
            defaultValue={periodStart}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Sampai</label>
          <input
            type="date"
            name="end"
            defaultValue={periodEnd}
            className="rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Tampilkan
        </button>
      </form>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-2.5">Karyawan</th>
                  <th className="px-4 py-2.5 text-right">Hadir</th>
                  <th className="px-4 py-2.5 text-right">Izin</th>
                  <th className="px-4 py-2.5 text-right">Sakit</th>
                  <th className="px-4 py-2.5 text-right">Alpa</th>
                  <th className="px-4 py-2.5 text-right">Off</th>
                  <th className="px-4 py-2.5 text-right">Telat</th>
                  <th className="px-5 py-2.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {rows.map((r) => (
                  <tr key={r.employeeId}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-900">{r.employeeName}</p>
                      {r.employeeNote && <p className="text-xs text-zinc-400">{r.employeeNote}</p>}
                    </td>
                    <td className="px-4 py-3 text-right text-emerald-600">{r.hadir}</td>
                    <td className="px-4 py-3 text-right text-amber-600">{r.izin}</td>
                    <td className="px-4 py-3 text-right text-sky-600">{r.sakit}</td>
                    <td className="px-4 py-3 text-right text-red-500">{r.alpa}</td>
                    <td className="px-4 py-3 text-right text-zinc-400">{r.off}</td>
                    <td className="px-4 py-3 text-right text-orange-500">{r.telat}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/business/${businessId}/attendance/rekap/${r.employeeId}?start=${periodStart}&end=${periodEnd}`}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
