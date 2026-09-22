import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LeaveRequestsClient, { type LeaveRequestRow } from "./leave-requests-client";

function fmtNum(v: number) {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export default async function LeaveRequestsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const year = new Date().getFullYear();

  const [{ data: requests }, { data: employees }, { data: leaveTypes }] = await Promise.all([
    supabase
      .from("leave_requests")
      .select(
        "id, start_date, end_date, days_count, reason, status, employees(name), leave_types(name)",
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(100),
    supabase
      .from("employees")
      .select("id, name")
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
  ]);

  const rows: LeaveRequestRow[] = (requests ?? []).map((r) => ({
    id: r.id,
    employeeName: (r.employees as unknown as { name: string } | null)?.name ?? "—",
    leaveTypeName: (r.leave_types as unknown as { name: string } | null)?.name ?? "—",
    startDate: r.start_date,
    endDate: r.end_date,
    daysCount: r.days_count,
    reason: r.reason,
    status: r.status as "pending" | "approved" | "rejected",
  }));

  // Sisa kuota per karyawan × jenis cuti aktif, dihitung dalam satu query
  // bulk (bukan N×M query terpisah) — SUM(days_count) approved tahun ini.
  const { data: approvedThisYear } = await supabase
    .from("leave_requests")
    .select("employee_id, leave_type_id, days_count")
    .eq("business_id", businessId)
    .eq("status", "approved")
    .gte("start_date", `${year}-01-01`)
    .lte("start_date", `${year}-12-31`);

  const usedMap = new Map<string, number>();
  for (const r of approvedThisYear ?? []) {
    const key = `${r.employee_id}:${r.leave_type_id}`;
    usedMap.set(key, (usedMap.get(key) ?? 0) + r.days_count);
  }

  const balanceRows = (employees ?? []).flatMap((e) =>
    (leaveTypes ?? []).map((lt) => {
      const used = usedMap.get(`${e.id}:${lt.id}`) ?? 0;
      return {
        employeeName: e.name,
        leaveTypeName: lt.name,
        quota: lt.default_days_per_year,
        used,
        remaining: Math.max(0, lt.default_days_per_year - used),
      };
    }),
  );

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Link
          href={`/business/${businessId}/leave-types`}
          className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
        >
          Kelola Jenis Cuti
        </Link>
      </div>
      {balanceRows.length > 0 && (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h2 className="text-sm font-semibold text-zinc-800">Sisa Kuota Cuti {year}</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                  <th className="px-5 py-2">Karyawan</th>
                  <th className="px-5 py-2">Jenis Cuti</th>
                  <th className="px-5 py-2 text-right">Kuota</th>
                  <th className="px-5 py-2 text-right">Terpakai</th>
                  <th className="px-5 py-2 text-right">Sisa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {balanceRows.map((b, i) => (
                  <tr key={i}>
                    <td className="px-5 py-2 text-zinc-800">{b.employeeName}</td>
                    <td className="px-5 py-2 text-zinc-500">{b.leaveTypeName}</td>
                    <td className="px-5 py-2 text-right text-zinc-500">{fmtNum(b.quota)}</td>
                    <td className="px-5 py-2 text-right text-zinc-500">{fmtNum(b.used)}</td>
                    <td className="px-5 py-2 text-right font-semibold text-zinc-900">
                      {fmtNum(b.remaining)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <LeaveRequestsClient
        businessId={businessId}
        requests={rows}
        employees={employees ?? []}
        leaveTypes={leaveTypes ?? []}
      />
    </div>
  );
}
