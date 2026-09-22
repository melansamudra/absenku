import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ShiftTemplatesPanel, { type ShiftTemplate } from "./shift-templates-panel";
import AssignmentRow from "./assignment-row";

function todayWib() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function shiftDate(dateStr: string, days: number) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + days);
  return dt.toISOString().slice(0, 10);
}

export default async function ShiftsPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const { businessId } = await params;
  const { date: dateParam } = await searchParams;
  const date = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? dateParam : todayWib();

  const supabase = await createClient();

  const [{ data: templates }, { data: employees }, { data: assignments }] = await Promise.all([
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
      .from("employee_shift_assignments")
      .select("employee_id, shift_template_id")
      .eq("business_id", businessId)
      .eq("date", date),
  ]);

  const assignmentByEmployee = new Map((assignments ?? []).map((a) => [a.employee_id, a.shift_template_id]));
  const shiftTemplates = (templates ?? []) as ShiftTemplate[];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Jadwal Shift</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Kelola shift dan tetapkan jadwal per karyawan per hari. Karyawan tanpa jadwal hari itu
          pakai jam kerja default bisnis (atur di Pengaturan).
        </p>
      </div>

      <div className="mb-5">
        <ShiftTemplatesPanel businessId={businessId} templates={shiftTemplates} />
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Link
          href={`?date=${shiftDate(date, -1)}`}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          ← Kemarin
        </Link>
        <span className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm">
          {date}
        </span>
        <Link
          href={`?date=${shiftDate(date, 1)}`}
          className="rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          Besok →
        </Link>
      </div>

      {shiftTemplates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Tambahkan minimal satu shift dulu di atas.</p>
        </div>
      ) : (employees ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {(employees ?? []).map((e) => (
              <AssignmentRow
                key={e.id}
                businessId={businessId}
                date={date}
                employeeId={e.id}
                employeeName={e.name}
                templates={shiftTemplates}
                assignedShiftTemplateId={assignmentByEmployee.get(e.id) ?? null}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
