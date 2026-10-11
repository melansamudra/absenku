import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageIcon, MapPin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { signSelfieUrls } from "@/lib/attendance/selfie";
import { Card, PageHeader } from "@/components/form-ui";
import ApprovalActions from "./approval-actions";

const TABS = [
  { key: "waiting", label: "Menunggu Persetujuan" },
  { key: "approved", label: "Disetujui" },
  { key: "rejected", label: "Ditolak" },
  { key: "all", label: "Semua" },
] as const;

function todayMonth() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7);
}
function shiftMonth(ym: string, delta: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}
function monthLabel(ym: string) {
  const [y, m] = ym.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}
function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
}
function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
}

export default async function AttendanceApprovalPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ tab?: string; month?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const tab = TABS.some((t) => t.key === sp.tab) ? (sp.tab as (typeof TABS)[number]["key"]) : "waiting";
  const month = sp.month && /^\d{4}-\d{2}$/.test(sp.month) ? sp.month : todayMonth();
  const from = `${month}-01`;
  const to = `${shiftMonth(month, 1)}-01`;

  const supabase = await createClient();
  const { data } = await supabase
    .from("attendance")
    .select(
      "id, date, status, note, late_minutes, check_in_at, check_out_at, check_in_lat, check_in_lng, check_in_photo_url, verified_by_admin, rejected_at, rejected_note, employees(name, employee_code)",
    )
    .eq("business_id", businessId)
    .gte("date", from)
    .lt("date", to)
    .not("check_in_at", "is", null)
    .order("date", { ascending: false })
    .order("check_in_at", { ascending: false });

  const stateOf = (r: { verified_by_admin: boolean; rejected_at: string | null }) =>
    r.rejected_at ? "rejected" : r.verified_by_admin ? "approved" : "waiting";

  const all = data ?? [];
  const counts = { waiting: 0, approved: 0, rejected: 0, all: all.length };
  for (const r of all) counts[stateOf(r)]++;
  const rows = tab === "all" ? all : all.filter((r) => stateOf(r) === tab);

  const selfies = await signSelfieUrls(supabase, rows.map((r) => r.check_in_photo_url));
  const base = `/business/${businessId}/attendance/approval`;

  return (
    <div>
      <PageHeader
        title="Approval Presensi"
        subtitle="Periksa selfie dan lokasi absen karyawan, lalu setujui atau tolak."
        actions={
          <div className="flex items-center gap-1.5">
            <Link href={`${base}?tab=${tab}&month=${shiftMonth(month, -1)}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Bulan sebelumnya">
              <ChevronLeft size={15} />
            </Link>
            <span className="min-w-36 rounded-lg bg-white px-3 py-2 text-center text-[13px] font-semibold text-zinc-800 shadow-sm">{monthLabel(month)}</span>
            <Link href={`${base}?tab=${tab}&month=${shiftMonth(month, 1)}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Bulan berikutnya">
              <ChevronRight size={15} />
            </Link>
          </div>
        }
      />

      <Card className="!p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-3">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={`${base}?tab=${t.key}&month=${month}`}
              className={`shrink-0 rounded-lg border px-4 py-1.5 text-[13px] ${
                tab === t.key
                  ? "border-brand-500 bg-white font-semibold text-brand-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t.label} <span className="text-zinc-400">({counts[t.key]})</span>
            </Link>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Nama</th>
                <th className="px-3 py-3">Tanggal</th>
                <th className="px-3 py-3">Masuk</th>
                <th className="px-3 py-3">Keluar</th>
                <th className="px-3 py-3">Lokasi</th>
                <th className="px-3 py-3">Foto</th>
                <th className="px-3 py-3">Keterangan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-14 text-center text-sm text-zinc-400">
                    {tab === "waiting"
                      ? "Tidak ada presensi yang menunggu persetujuan. Presensi selfie karyawan akan muncul di sini."
                      : "Tidak ada data."}
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const st = stateOf(r);
                const photo = r.check_in_photo_url ? selfies.get(r.check_in_photo_url) : null;
                return (
                  <tr key={r.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-900">{r.employees?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{r.employees?.employee_code ?? ""}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{fmtDate(r.date)}</td>
                    <td className="px-3 py-3 text-zinc-700">
                      {fmtTime(r.check_in_at)}
                      {r.late_minutes > 0 && <span className="ml-1 text-[11px] font-semibold text-orange-600">telat {r.late_minutes} mnt</span>}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{fmtTime(r.check_out_at)}</td>
                    <td className="px-3 py-3">
                      {r.check_in_lat != null && r.check_in_lng != null ? (
                        <a
                          href={`https://www.google.com/maps?q=${r.check_in_lat},${r.check_in_lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-brand-700 hover:underline"
                        >
                          <MapPin size={13} /> Lihat peta
                        </a>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {photo ? (
                        <a href={photo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-brand-700 hover:underline">
                          <ImageIcon size={13} /> Selfie
                        </a>
                      ) : (
                        <span className="text-zinc-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-zinc-500">
                      {st === "rejected" ? (
                        <span className="text-red-600">Ditolak{r.rejected_note ? `: ${r.rejected_note}` : ""}</span>
                      ) : st === "approved" ? (
                        <span className="text-emerald-700">Disetujui</span>
                      ) : (
                        r.note ?? "—"
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <ApprovalActions businessId={businessId} attendanceId={r.id} state={st} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
