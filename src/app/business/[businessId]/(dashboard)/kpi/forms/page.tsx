import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, btnPrimary } from "@/components/form-ui";
import { deleteKpiForm } from "../actions";
import { DeleteButton, KpiTabs } from "../kpi-ui";

export default async function KpiFormsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const base = `/business/${businessId}/kpi/forms`;

  const { data: forms } = await supabase
    .from("kpi_forms")
    .select("id, name, description, status, created_at, kpi_indicators(weight)")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  return (
    <div>
      <PageHeader
        title="KPI"
        subtitle="Formulir indikator kinerja yang dipakai untuk menilai karyawan."
        actions={
          <Link href={`${base}/new`} className={btnPrimary}>
            <Plus size={15} /> Tambah Formulir
          </Link>
        }
      />
      <KpiTabs businessId={businessId} active="forms" />

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[14px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Nama Formulir</th>
                <th className="px-3 py-3">Indikator</th>
                <th className="px-3 py-3">Total Bobot</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(forms ?? []).length === 0 && (
                <tr>
                  <td colSpan={6} className="py-14 text-center text-sm text-zinc-400">
                    Belum ada formulir KPI. Buat formulir pertama dengan indikator dan bobotnya.
                  </td>
                </tr>
              )}
              {(forms ?? []).map((f, i) => {
                const inds = (f.kpi_indicators ?? []) as { weight: number }[];
                const total = inds.reduce((t, x) => t + Number(x.weight), 0);
                return (
                  <tr key={f.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <Link href={`${base}/${f.id}`} className="font-medium text-brand-700 hover:underline">
                        {f.name}
                      </Link>
                      {f.description && <p className="text-xs text-zinc-400">{f.description}</p>}
                    </td>
                    <td className="px-3 py-3 text-zinc-700">{inds.length}</td>
                    <td className={`px-3 py-3 font-semibold ${Math.abs(total - 100) < 0.01 ? "text-zinc-900" : "text-amber-600"}`}>
                      {Math.round(total * 100) / 100}%
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${
                          f.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-500"
                        }`}
                      >
                        {f.status === "active" ? "Tersedia" : "Draft"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`${base}/${f.id}`} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700" aria-label="Ubah">
                          <Pencil size={15} />
                        </Link>
                        <DeleteButton action={deleteKpiForm.bind(null, businessId, f.id)} confirmText={`Hapus formulir "${f.name}"?`} />
                      </div>
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
