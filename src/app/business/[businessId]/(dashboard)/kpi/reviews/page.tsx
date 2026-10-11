import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { gradeOf } from "@/lib/kpi/score";
import { Card, PageHeader, btnOutline } from "@/components/form-ui";
import { KpiTabs } from "../kpi-ui";

export default async function KpiReviewsPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ schedule?: string; status?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const base = `/business/${businessId}/kpi/reviews`;
  const supabase = await createClient();

  const [{ data: schedules }, { data: reviews }] = await Promise.all([
    supabase.from("kpi_schedules").select("id, name").eq("business_id", businessId).order("created_at", { ascending: false }),
    supabase
      .from("kpi_reviews")
      .select("id, schedule_id, status, total_score, reviewed_at, kpi_schedules(name, observe_start, observe_end), employees(name, employee_code, positions(name))")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false }),
  ]);

  const selected = (schedules ?? []).find((s) => s.id === sp.schedule)?.id ?? "";
  const status = sp.status === "pending" || sp.status === "done" ? sp.status : "all";
  const rows = (reviews ?? []).filter((r) => (!selected || r.schedule_id === selected) && (status === "all" || r.status === status));

  const link = (patch: { schedule?: string; status?: string }) => {
    const q = new URLSearchParams();
    const sch = patch.schedule ?? selected;
    const st = patch.status ?? status;
    if (sch) q.set("schedule", sch);
    if (st !== "all") q.set("status", st);
    const s = q.toString();
    return s ? `${base}?${s}` : base;
  };

  return (
    <div>
      <PageHeader title="KPI" subtitle="Beri nilai kinerja karyawan berdasarkan formulir di jadwal penilaian." />
      <KpiTabs businessId={businessId} active="reviews" />

      <Card className="!p-0">
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 p-3">
          {(["all", "pending", "done"] as const).map((s) => (
            <Link
              key={s}
              href={link({ status: s })}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${status === s ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"}`}
            >
              {s === "all" ? "Semua" : s === "pending" ? "Belum dinilai" : "Sudah dinilai"}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-2">
            {selected && (
              <Link href={link({ schedule: "" })} className={btnOutline}>
                Semua jadwal
              </Link>
            )}
            <div className="flex gap-1 overflow-x-auto">
              {(schedules ?? []).slice(0, 4).map((s) => (
                <Link
                  key={s.id}
                  href={link({ schedule: s.id })}
                  className={`shrink-0 rounded-lg border px-3 py-1 text-xs ${selected === s.id ? "border-brand-500 font-semibold text-brand-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50"}`}
                >
                  {s.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Karyawan</th>
                <th className="px-3 py-3">Jadwal</th>
                <th className="px-3 py-3">Nilai Akhir</th>
                <th className="px-3 py-3">Predikat</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-zinc-400">
                    Belum ada evaluasi. Buat jadwal KPI untuk memulai penilaian.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const g = gradeOf(r.status === "done" ? Number(r.total_score) : null);
                const emp = r.employees as unknown as { name: string; employee_code: string | null; positions: { name: string } | null } | null;
                return (
                  <tr key={r.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-900">{emp?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{[emp?.employee_code, emp?.positions?.name].filter(Boolean).join(" · ")}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">{(r.kpi_schedules as unknown as { name: string } | null)?.name ?? "—"}</td>
                    <td className="px-3 py-3 font-semibold text-zinc-900">{r.status === "done" ? Number(r.total_score).toLocaleString("id-ID") : "—"}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${g.badge}`}>{g.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link href={`${base}/${r.id}`} className={r.status === "done" ? btnOutline : "inline-flex items-center rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"}>
                        {r.status === "done" ? "Lihat / Ubah" : "Nilai"}
                      </Link>
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
