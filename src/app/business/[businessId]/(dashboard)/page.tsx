import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

  const [{ data: employees }, { data: attendanceToday }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, active")
      .eq("business_id", businessId)
      .is("deleted_at", null),
    supabase
      .from("attendance")
      .select("status")
      .eq("business_id", businessId)
      .eq("date", today),
  ]);

  const activeCount = (employees ?? []).filter((e) => e.active).length;
  const totalCount = (employees ?? []).length;

  const statusCounts: Record<string, number> = {};
  for (const row of attendanceToday ?? []) {
    statusCounts[row.status] = (statusCounts[row.status] ?? 0) + 1;
  }
  const belumAbsen = Math.max(0, activeCount - (attendanceToday?.length ?? 0));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Ringkasan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Absensi hari ini, {today}</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-400">Karyawan Aktif</p>
          <p className="mt-1.5 text-2xl font-bold text-zinc-900">{activeCount}</p>
          <p className="mt-1 text-xs text-zinc-400">dari {totalCount} total</p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-400">Hadir</p>
          <p className="mt-1.5 text-2xl font-bold text-emerald-600">
            {statusCounts.hadir ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-400">Izin/Sakit</p>
          <p className="mt-1.5 text-2xl font-bold text-amber-600">
            {(statusCounts.izin ?? 0) + (statusCounts.sakit ?? 0)}
          </p>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-medium text-zinc-400">Belum Absen</p>
          <p className="mt-1.5 text-2xl font-bold text-zinc-900">{belumAbsen}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Karyawan</h2>
          <p className="mb-4 text-xs text-zinc-500">Kelola data karyawan & tarif gaji.</p>
          <Link
            href={`/business/${businessId}/employees`}
            className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Kelola Karyawan
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Absensi</h2>
          <p className="mb-4 text-xs text-zinc-500">Tandai kehadiran manual atau cek rekap.</p>
          <Link
            href={`/business/${businessId}/attendance`}
            className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Buka Absensi
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Payroll</h2>
          <p className="mb-4 text-xs text-zinc-500">Buat & kelola slip gaji per periode.</p>
          <Link
            href={`/business/${businessId}/payroll`}
            className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white hover:bg-brand-700"
          >
            Buka Payroll
          </Link>
        </div>
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Link Absen Selfie</h2>
          <p className="mb-4 text-xs text-zinc-500">
            Bagikan link/poster QR ini ke karyawan untuk absen sendiri.
          </p>
          <Link
            href={`/business/${businessId}/settings`}
            className="inline-block rounded-lg border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Lihat Link
          </Link>
        </div>
      </div>
    </div>
  );
}
