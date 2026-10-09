import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { loadPendingCounts } from "@/lib/dashboard/pending";

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
      .select("id, active")
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

  const pendingItems = [
    { label: "Cuti", count: pending.cuti, href: "leave-requests" },
    { label: "Lembur", count: pending.lembur, href: "overtime" },
    { label: "Reimbursement", count: pending.reimbursements, href: "reimbursements" },
  ];
  const pendingTotal = pendingItems.reduce((sum, i) => sum + i.count, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Ringkasan</h1>
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
                <p className="text-[11px] font-medium text-zinc-600">{i.label}</p>
              </Link>
            ))}
          </div>
        )}
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
