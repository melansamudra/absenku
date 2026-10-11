import { createClient } from "@/lib/supabase/server";
import LeaveRequestsClient, { type LeaveRequestRow } from "./leave-requests-client";

export default async function LeaveRequestsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: requests }, { data: employees }, { data: leaveTypes }] = await Promise.all([
    supabase
      .from("leave_requests")
      .select(
        "id, leave_type_id, created_at, start_date, end_date, days_count, reason, status, employees(name, employee_code), leave_types(name)",
      )
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(500),
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("leave_types")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
  ]);

  const rows: LeaveRequestRow[] = (requests ?? []).map((r) => ({
    id: r.id,
    leaveTypeId: r.leave_type_id,
    employeeName: r.employees?.name ?? "—",
    employeeCode: r.employees?.employee_code ?? null,
    leaveTypeName: r.leave_types?.name ?? "—",
    createdAt: r.created_at,
    startDate: r.start_date,
    endDate: r.end_date,
    daysCount: r.days_count,
    reason: r.reason,
    status: r.status as "pending" | "approved" | "rejected",
  }));

  return (
    <LeaveRequestsClient
      businessId={businessId}
      requests={rows}
      employees={employees ?? []}
      leaveTypes={leaveTypes ?? []}
    />
  );
}
