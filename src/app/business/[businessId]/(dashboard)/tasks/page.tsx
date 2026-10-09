import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { todayWib } from "@/lib/portal/dates";
import TaskForm from "./task-form";
import TaskRow, { type TaskItem } from "./task-row";

const employeeName = (e: unknown) => (e as { name: string } | null)?.name ?? "—";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function TasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ businessId: string }>;
  searchParams: Promise<{ emp?: string; from?: string; to?: string }>;
}) {
  const { businessId } = await params;
  const sp = await searchParams;
  const empFilter = sp.emp && UUID_RE.test(sp.emp) ? sp.emp : "";
  const fromFilter = sp.from && DATE_RE.test(sp.from) ? sp.from : "";
  const toFilter = sp.to && DATE_RE.test(sp.to) ? sp.to : "";
  const filtered = !!(empFilter || fromFilter || toFilter);
  const supabase = await createClient();
  const today = todayWib();

  const [{ data: employees }, { data: taskRows }, { data: activityRows }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("name", { ascending: true }),
    supabase
      .from("employee_tasks")
      .select("id, title, description, due_date, status, employees(name)")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100),
    (() => {
      let q = supabase
        .from("employee_activities")
        .select("id, date, title, description, employees(name)")
        .eq("business_id", businessId);
      if (empFilter) q = q.eq("employee_id", empFilter);
      if (fromFilter) q = q.gte("date", fromFilter);
      if (toFilter) q = q.lte("date", toFilter);
      return q
        .order("date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(filtered ? 300 : 50);
    })(),
  ]);

  const tasks: TaskItem[] = (taskRows ?? []).map((t) => {
    const status = (["todo", "in_progress", "done"].includes(t.status) ? t.status : "todo") as TaskItem["status"];
    return {
      id: t.id,
      employeeName: employeeName(t.employees),
      title: t.title,
      description: t.description,
      dueDate: t.due_date,
      status,
      overdue: status !== "done" && !!t.due_date && t.due_date < today,
    };
  });
  const open = tasks.filter((t) => t.status !== "done");
  const done = tasks.filter((t) => t.status === "done");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Tugas &amp; Kegiatan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Beri tugas ke karyawan — mereka memperbarui statusnya dari Portal Karyawan. Laporan
          kegiatan harian dari portal muncul di bagian bawah.
        </p>
      </div>

      <h2 className="mb-2 text-sm font-semibold text-zinc-800">Tugas berjalan ({open.length})</h2>
      {open.length === 0 ? (
        <div className="mb-6 rounded-xl border border-dashed border-zinc-300 bg-white py-8 text-center">
          <p className="text-sm text-zinc-500">Tidak ada tugas yang sedang berjalan.</p>
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {open.map((t) => (
              <TaskRow key={t.id} businessId={businessId} task={t} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Beri Tugas Baru</h2>
        <TaskForm businessId={businessId} employees={employees ?? []} />
      </div>

      {done.length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">Tugas selesai ({done.length})</h2>
          <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
            <div className="divide-y divide-zinc-100">
              {done.map((t) => (
                <TaskRow key={t.id} businessId={businessId} task={t} />
              ))}
            </div>
          </div>
        </>
      )}

      <h2 className="mb-2 text-sm font-semibold text-zinc-800">
        Kegiatan karyawan ({filtered ? `${(activityRows ?? []).length} hasil filter` : "50 terbaru"})
      </h2>
      <form method="get" className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-zinc-100 bg-white p-3 shadow-sm">
        <div>
          <label htmlFor="f-emp" className="mb-1 block text-[11px] font-medium text-zinc-500">Karyawan</label>
          <select id="f-emp" name="emp" defaultValue={empFilter} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs">
            <option value="">Semua karyawan</option>
            {(employees ?? []).map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-from" className="mb-1 block text-[11px] font-medium text-zinc-500">Dari</label>
          <input id="f-from" name="from" type="date" defaultValue={fromFilter} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs" />
        </div>
        <div>
          <label htmlFor="f-to" className="mb-1 block text-[11px] font-medium text-zinc-500">Sampai</label>
          <input id="f-to" name="to" type="date" defaultValue={toFilter} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-xs" />
        </div>
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
          Terapkan
        </button>
        {filtered && (
          <Link href={`/business/${businessId}/tasks`} className="px-1 py-1.5 text-xs text-zinc-500 hover:text-zinc-800">
            Reset
          </Link>
        )}
      </form>
      {(activityRows ?? []).length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-8 text-center">
          <p className="text-sm text-zinc-500">
            {filtered ? "Tidak ada kegiatan yang cocok dengan filter." : "Belum ada laporan kegiatan dari karyawan."}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {(activityRows ?? []).map((a) => (
              <div key={a.id} className="px-5 py-3">
                <p className="text-sm text-zinc-800">
                  <span className="font-medium">{employeeName(a.employees)}</span> · {a.date} · {a.title}
                </p>
                {a.description && <p className="mt-0.5 text-xs text-zinc-400">{a.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
