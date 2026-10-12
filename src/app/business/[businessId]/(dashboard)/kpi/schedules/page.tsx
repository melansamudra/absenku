import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, btnPrimary } from "@/components/form-ui";
import { deleteKpiSchedule } from "../actions";
import { DeleteButton, KpiTabs } from "../kpi-ui";

const STATUS: Record<string, { label: string; badge: string }> = {
  active: { label: "Tersedia", badge: "bg-brand-100 text-brand-800" },
  done: { label: "Selesai", badge: "bg-emerald-50 text-emerald-700" },
  draft: { label: "Draft", badge: "bg-zinc-100 text-zinc-500" },
};

function fmtDate(d: string) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export default async function KpiSchedulesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const base = `/business/${businessId}/kpi`;

  const { data: schedules } = await supabase
    .from("kpi_schedules")
    .select("id, name, observe_start, observe_end, status, kpi_forms(name), kpi_reviews(status)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="KPI"
        subtitle="Jadwalkan periode penilaian dan tentukan karyawan yang dinilai."
        actions={
          <Link href={`${base}/schedules/new`} className={btnPrimary}>
            <Plus size={15} /> Tambah Jadwal KPI
          </Link>
        }
      />
      <KpiTabs businessId={businessId} active="schedules" />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[14px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Nama Jadwal</th>
                <th className="px-3 py-3">Formulir</th>
                <th className="px-3 py-3">Periode Observasi</th>
                <th className="px-3 py-3">Progres</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(schedules ?? []).length === 0 && (
                <tr>
                  <td colSpan={7} className="py-14 text-center text-sm text-zinc-400">
                    Belum ada jadwal KPI. Buat formulir yang berstatus Tersedia, lalu jadwalkan penilaiannya.
                  </td>
                </tr>
              )}
              {(schedules ?? []).map((s, i) => {
                const reviews = (s.kpi_reviews ?? []) as { status: string }[];
                const done = reviews.filter((r) => r.status === "done").length;
                const st = STATUS[s.status] ?? STATUS.draft;
                return (
                  <tr key={s.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <Link href={`${base}/reviews?schedule=${s.id}`} className="font-medium text-brand-700 hover:underline">
                        {s.name}
                      </Link>
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{(s.kpi_forms as unknown as { name: string } | null)?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-zinc-600">
                      {fmtDate(s.observe_start)} – {fmtDate(s.observe_end)}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">
                      {done}/{reviews.length} dinilai
                    </td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${st.badge}`}>{st.label}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <DeleteButton action={deleteKpiSchedule.bind(null, businessId, s.id)} confirmText={`Hapus jadwal "${s.name}" beserta seluruh hasil penilaiannya?`} />
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
