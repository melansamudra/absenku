import { createClient } from "@/lib/supabase/server";
import LeaveTypesClient, { type LeaveType } from "./leave-types-client";

export default async function LeaveTypesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: leaveTypes } = await supabase
    .from("leave_types")
    .select("id, name, default_days_per_year, max_carryover_days, paid, active")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  return <LeaveTypesClient businessId={businessId} leaveTypes={(leaveTypes ?? []) as LeaveType[]} />;
}
