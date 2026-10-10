import { createClient } from "@/lib/supabase/server";
import { announcementCategoryLabel } from "@/lib/announcements/categories";
import AnnouncementForm from "./announcement-form";
import AnnouncementRow, { type AnnouncementItem } from "./announcement-row";

const todayWib = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
const fmt = (d: string) => new Date(`${d}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function PengumumanPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("announcements")
    .select("id, title, body, category, pinned, expires_at, created_at")
    .eq("business_id", businessId)
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(100);

  const today = todayWib();
  const items: AnnouncementItem[] = (data ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    body: a.body,
    categoryLabel: announcementCategoryLabel(a.category),
    pinned: a.pinned,
    date: fmt(new Date(a.created_at).toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })),
    expiresLabel: a.expires_at ? fmt(a.expires_at) : null,
    expired: !!a.expires_at && a.expires_at < today,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Papan Informasi</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Pengumuman untuk semua karyawan — muncul di Beranda dan menu Papan Info di Portal Karyawan. Yang sudah lewat tanggal berakhir otomatis disembunyikan dari portal.</p>
      </div>

      {error ? (
        <p className="mb-6 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {error.message.includes("does not exist") || error.message.includes("schema cache") ? "Jalankan dulu SQL Papan Informasi di Supabase." : error.message}
        </p>
      ) : (
        <div className="mb-6 rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-zinc-800">Buat Pengumuman</h2>
          <AnnouncementForm businessId={businessId} />
        </div>
      )}

      {!error && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">Semua pengumuman ({items.length})</h2>
          {items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-8 text-center">
              <p className="text-sm text-zinc-400">Belum ada pengumuman.</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
              <div className="divide-y divide-zinc-100">
                {items.map((i) => (
                  <AnnouncementRow key={i.id} businessId={businessId} item={i} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
