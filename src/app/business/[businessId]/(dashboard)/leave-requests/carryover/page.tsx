import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader, btnOutline } from "@/components/form-ui";
import CalculateCarryoverButton from "./calculate-button";

const fmtNum = (v: number) => (Number.isInteger(v) ? String(v) : v.toFixed(1));

export default async function CarryoverPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ year?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const thisYear = new Date().getFullYear();
  const year = sp.year && /^\d{4}$/.test(sp.year) ? Number(sp.year) : thisYear;
  const base = `/business/${businessId}/leave-requests/carryover`;

  const supabase = await createClient();
  const { data: carryovers } = await supabase
    .from("leave_carryovers")
    .select("days, employees(name, employee_code), leave_types(name)")
    .eq("business_id", businessId)
    .eq("year", year)
    .gt("days", 0)
    .order("days", { ascending: false });

  const rows = carryovers ?? [];

  return (
    <div>
      <Link
        href={`/business/${businessId}/leave-requests`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Izin &amp; Cuti
      </Link>
      <PageHeader
        title="Carry-over Cuti"
        subtitle="Bawa sisa kuota cuti tahun sebelumnya ke tahun berjalan, dibatasi oleh Carry-over maks. tiap jenis cuti (atur di halaman Jenis Cuti)."
        actions={
          <div className="flex items-center gap-1.5">
            <Link href={`${base}?year=${year - 1}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Tahun sebelumnya">
              <ChevronLeft size={15} />
            </Link>
            <span className="min-w-20 rounded-lg bg-white px-3 py-2 text-center text-[14px] font-semibold shadow-sm">{year}</span>
            <Link href={`${base}?year=${year + 1}`} className="rounded-lg border border-zinc-200 bg-white p-2 hover:bg-zinc-50" aria-label="Tahun berikutnya">
              <ChevronRight size={15} />
            </Link>
            <Link href={`/business/${businessId}/leave-types`} className={btnOutline}>
              Kelola Jenis Cuti
            </Link>
          </div>
        }
      />

      <Card className="mb-5">
        <h2 className="mb-1.5 text-sm font-semibold text-zinc-900">Hitung Carry-over ke {year}</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Dihitung dari sisa kuota {year - 1} (kuota + carry-over masuk &minus; terpakai), lalu
          dibatasi Carry-over maks. Menjalankan ulang akan menimpa hasil hitung {year} sebelumnya.
        </p>
        <CalculateCarryoverButton businessId={businessId} targetYear={year} />
      </Card>

      <Card className="!p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-[14px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="px-5 py-3">Karyawan</th>
                <th className="px-3 py-3">Jenis Cuti</th>
                <th className="px-3 py-3 text-right">Carry-over {year}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-14 text-center text-sm text-zinc-400">
                    Belum ada carry-over untuk tahun {year}. Jalankan hitung di atas.
                  </td>
                </tr>
              )}
              {rows.map((r, i) => {
                const employee = r.employees as unknown as { name: string; employee_code: string | null } | null;
                const leaveType = r.leave_types as unknown as { name: string } | null;
                return (
                  <tr key={i} className="hover:bg-zinc-50/60">
                    <td className="px-5 py-3">
                      <p className="font-medium text-zinc-900">{employee?.name ?? "—"}</p>
                      <p className="text-xs text-zinc-400">{employee?.employee_code ?? ""}</p>
                    </td>
                    <td className="px-3 py-3 text-zinc-600">{leaveType?.name ?? "—"}</td>
                    <td className="px-3 py-3 text-right font-semibold text-zinc-900">{fmtNum(r.days)}</td>
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
