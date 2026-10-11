import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, btnOutline } from "@/components/form-ui";

const fmtNum = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export default async function LeaveBalancePage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ year?: string; type?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const thisYear = new Date().getFullYear();
  const year = sp.year && /^\d{4}$/.test(sp.year) ? Number(sp.year) : thisYear;
  const base = `/business/${businessId}/leave-requests/balance`;

  const supabase = await createClient();
  const [{ data: employees }, { data: leaveTypes }, { data: approved }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name, employee_code")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("leave_types")
      .select("id, name, default_days_per_year")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
    supabase
      .from("leave_requests")
      .select("employee_id, leave_type_id, days_count")
      .eq("business_id", businessId)
      .eq("status", "approved")
      .gte("start_date", `${year}-01-01`)
      .lte("start_date", `${year}-12-31`),
  ]);

  const used = new Map<string, number>();
  for (const r of approved ?? []) {
    const k = `${r.employee_id}:${r.leave_type_id}`;
    used.set(k, (used.get(k) ?? 0) + r.days_count);
  }

  const types = leaveTypes ?? [];
  const selected = types.find((t) => t.id === sp.type) ?? null;
  const shownTypes = selected ? [selected] : types;

  return (
    <div>
      <Link href={`/business/${businessId}/leave-requests`} className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700">
        <ChevronLeft size={14} /> Izin &amp; Cuti
      </Link>
      <PageHeader
        title="Sisa Cuti"
        subtitle="Kuota dikurangi pengajuan yang sudah disetujui pada tahun berjalan."
        actions={
          <div className="flex items-center gap-1.5">
            <Link href={`${base}?year=${year - 1}${selected ? `&type=${selected.id}` : ""}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Tahun sebelumnya">
              <ChevronLeft size={15} />
            </Link>
            <span className="min-w-20 rounded-lg bg-white px-3 py-2 text-center text-[13px] font-semibold shadow-sm">{year}</span>
            <Link href={`${base}?year=${year + 1}${selected ? `&type=${selected.id}` : ""}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Tahun berikutnya">
              <ChevronRight size={15} />
            </Link>
            <Link href={`/business/${businessId}/leave-types`} className={btnOutline}>
              Kelola Jenis Cuti
            </Link>
          </div>
        }
      />

      <Card className="!p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-3">
          {[{ id: "", name: "Semua jenis" }, ...types].map((t) => (
            <Link
              key={t.id || "all"}
              href={`${base}?year=${year}${t.id ? `&type=${t.id}` : ""}`}
              className={`shrink-0 rounded-lg border px-4 py-1.5 text-[13px] ${
                (selected?.id ?? "") === t.id
                  ? "border-brand-500 bg-white font-semibold text-brand-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t.name}
            </Link>
          ))}
        </div>

        {types.length === 0 ? (
          <p className="py-14 text-center text-sm text-zinc-400">
            Belum ada jenis cuti aktif. Tambahkan di halaman Jenis Cuti.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
                <tr>
                  <th className="w-12 px-5 py-3">No.</th>
                  <th className="px-3 py-3">Karyawan</th>
                  {shownTypes.map((t) => (
                    <th key={t.id} className="px-3 py-3 text-right">
                      {t.name}
                      <span className="block text-[10px] font-normal text-zinc-400">sisa / kuota {fmtNum(t.default_days_per_year)}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {(employees ?? []).length === 0 && (
                  <tr>
                    <td colSpan={2 + shownTypes.length} className="py-14 text-center text-sm text-zinc-400">
                      Belum ada karyawan aktif.
                    </td>
                  </tr>
                )}
                {(employees ?? []).map((e, i) => (
                  <tr key={e.id} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3 text-zinc-500">{i + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-zinc-900">{e.name}</p>
                      <p className="text-xs text-zinc-400">{e.employee_code ?? ""}</p>
                    </td>
                    {shownTypes.map((t) => {
                      const u = used.get(`${e.id}:${t.id}`) ?? 0;
                      const left = Math.max(0, t.default_days_per_year - u);
                      const low = t.default_days_per_year > 0 && left === 0;
                      return (
                        <td key={t.id} className="px-3 py-3 text-right">
                          <span className={`font-semibold ${low ? "text-red-600" : "text-zinc-900"}`}>{fmtNum(left)}</span>
                          <span className="text-xs text-zinc-400"> · terpakai {fmtNum(u)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
