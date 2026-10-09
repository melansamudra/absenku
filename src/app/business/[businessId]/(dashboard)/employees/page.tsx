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
      "id, name, salary_type, daily_rate, monthly_rate, active, note, email, contract_end, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ptkp_status, bpjs_kesehatan, bpjs_ketenagakerjaan, bpjs_wage_base, nik, join_date, bank_name, bank_account_number, bank_account_name, attendance_pin_hash",
    )
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  // Hash PIN tidak pernah dikirim ke browser — cukup flag ada/tidaknya.
  const rows: EmployeeRow[] = (employees ?? []).map(({ attendance_pin_hash, ...e }) => ({
    ...(e as Omit<EmployeeRow, "has_pin">),
    has_pin: attendance_pin_hash !== null,
  }));

  return <EmployeesClient businessId={businessId} employees={rows} />;
}
