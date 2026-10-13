import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/form-ui";
import WeeklyScheduleRow from "./weekly-schedule-row";
import ApplyScheduleForm from "./apply-schedule-form";
import type { ShiftTemplate } from "../shift-templates-panel";

const WEEKDAYS = [
  { n: 1, label: "Senin" },
  { n: 2, label: "Selasa" },
  { n: 3, label: "Rabu" },
  { n: 4, label: "Kamis" },
  { n: 5, label: "Jumat" },
  { n: 6, label: "Sabtu" },
  { n: 7, label: "Minggu" },
];

export default async function WeeklyPatternPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: templates }, { data: employees }, { data: patterns }] = await Promise.all([
    supabase
      .from("shift_templates")
      .select("id, name, start_time, end_time")
      .eq("business_id", businessId)
      .order("start_time", { ascending: true }),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("employee_weekly_schedules")
      .select("employee_id, weekday, shift_template_id")
      .eq("business_id", businessId),
  ]);

  const shiftTemplates = (templates ?? []) as ShiftTemplate[];
  const patternByKey = new Map((patterns ?? []).map((p) => [`${p.employee_id}:${p.weekday}`, p.shift_template_id]));

  return (
    <div>
      <Link
        href={`/business/${businessId}/shifts`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Jadwal Shift
      </Link>
      <PageHeader
        title="Jadwal Tetap (Pola Mingguan)"
        subtitle="Atur pola shift tiap karyawan sekali untuk Senin–Minggu, lalu terapkan ke rentang tanggal sekaligus — tidak perlu atur satu-satu tiap hari."
      />

      <div className="mb-5 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Terapkan Pola ke Tanggal</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Mengisi jadwal shift harian berdasarkan pola di bawah — tanggal yang sudah punya jadwal
          manual (diatur di halaman Jadwal Shift) tidak akan ditimpa.
        </p>
        <ApplyScheduleForm businessId={businessId} />
      </div>

      {shiftTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">
            Tambahkan minimal satu shift dulu di{" "}
            <Link href={`/business/${businessId}/shifts`} className="font-medium text-brand-600 hover:underline">
              halaman Jadwal Shift
            </Link>
            .
          </p>
        </div>
      ) : (employees ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-100 bg-white shadow-sm">
          <table className="w-full min-w-[800px] text-left text-[14px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="sticky left-0 z-10 bg-zinc-50 px-5 py-3">Karyawan</th>
                {WEEKDAYS.map((w) => (
                  <th key={w.n} className="px-2 py-3 text-center">
                    {w.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {(employees ?? []).map((e) => (
                <tr key={e.id}>
                  <td className="sticky left-0 z-10 bg-white px-5 py-2.5 font-medium text-zinc-900">{e.name}</td>
                  {WEEKDAYS.map((w) => (
                    <td key={w.n} className="px-2 py-2.5">
                      <WeeklyScheduleRow
                        businessId={businessId}
                        employeeId={e.id}
                        weekday={w.n}
                        templates={shiftTemplates}
                        assignedShiftTemplateId={patternByKey.get(`${e.id}:${w.n}`) ?? null}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
