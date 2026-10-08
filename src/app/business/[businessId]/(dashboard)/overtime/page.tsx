import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OvertimeRequestRow, { type PendingOvertime } from "./overtime-request-row";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  approved: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-600" },
};

export default async function OvertimePage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: business }, { data: pendingRows }, { data: historyRows }] = await Promise.all([
    supabase.from("businesses").select("overtime_approval_required").eq("id", businessId).single(),
    supabase
      .from("overtime_requests")
      .select("id, date, hours, reason, employees(name)")
      .eq("business_id", businessId)
      .eq("status", "pending")
      .order("date", { ascending: true }),
    supabase
      .from("overtime_requests")
      .select("id, date, hours, status, reviewed_note, employees(name)")
      .eq("business_id", businessId)
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(30),
  ]);

  const employeeName = (e: unknown) => (e as { name: string } | null)?.name ?? "—";
  const pending: PendingOvertime[] = (pendingRows ?? []).map((r) => ({
    id: r.id,
    employeeName: employeeName(r.employees),
    date: r.date,
    hours: Number(r.hours),
    reason: r.reason,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Lembur</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Pengajuan lembur dari Portal Karyawan. Jam yang disetujui masuk ke absensi tanggal itu dan
          ikut terhitung di rekap payroll.
        </p>
      </div>

      {!business?.overtime_approval_required && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Mode pengajuan lembur sedang mati — lembur masih dihitung otomatis dari jam absen pulang.
          Aktifkan di{" "}
          <Link href={`/business/${businessId}/settings`} className="font-semibold underline">
            Pengaturan → Lembur
          </Link>
          .
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold text-zinc-800">Menunggu persetujuan ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="mb-6 rounded-xl border border-dashed border-zinc-300 bg-white py-10 text-center">
          <p className="text-sm text-zinc-500">Tidak ada pengajuan lembur yang menunggu.</p>
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {pending.map((r) => (
              <OvertimeRequestRow key={r.id} businessId={businessId} request={r} />
            ))}
          </div>
        </div>
      )}

      {(historyRows ?? []).length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">Riwayat</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
            <div className="divide-y divide-zinc-100">
              {(historyRows ?? []).map((r) => {
                const status = STATUS_LABEL[r.status] ?? STATUS_LABEL.rejected;
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-zinc-800">
                        {employeeName(r.employees)} · {r.date} · {Number(r.hours)} jam
                      </p>
                      {r.reviewed_note && <p className="text-xs text-zinc-400">{r.reviewed_note}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
