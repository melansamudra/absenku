import { createClient } from "@/lib/supabase/server";

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString("id-ID", {
    timeZone: "Asia/Jakarta",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ActivityLogPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: logs } = await supabase
    .from("activity_log")
    .select("id, actor, action, detail, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Log Aktivitas</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Riwayat aksi sensitif — karyawan dihapus, slip gaji ditandai lunas, cuti
          disetujui/ditolak, pengaturan diubah. 100 aksi terakhir.
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada aktivitas tercatat.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {logs.map((log) => (
              <div key={log.id} className="px-5 py-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-zinc-900">{log.action}</p>
                  <p className="shrink-0 text-xs text-zinc-400">{fmtDateTime(log.created_at)}</p>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {log.detail ? `${log.detail} · ` : ""}
                  oleh {log.actor}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
