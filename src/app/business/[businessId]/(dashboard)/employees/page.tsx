import { createClient } from "@/lib/supabase/server";
import EmployeesClient, { type EmployeeRow } from "./employees-client";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select(
      "id, name, salary_type, daily_rate, monthly_rate, active, note, email, contract_end, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ptkp_status",
    )
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (
    <EmployeesClient businessId={businessId} employees={(employees ?? []) as EmployeeRow[]} />
  );
}
