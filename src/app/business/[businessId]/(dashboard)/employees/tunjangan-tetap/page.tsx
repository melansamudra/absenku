import { createClient } from "@/lib/supabase/server";
import RecurringAllowancesClient, {
  type EmployeeWithAllowances,
} from "./recurring-allowances-client";

export default async function TunjanganTetapPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: employees }, { data: allowances }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
    supabase
      .from("employee_recurring_allowances")
      .select("id, employee_id, label, amount, active")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  ]);

  const allowancesByEmployee = new Map<string, EmployeeWithAllowances["allowances"]>();
  for (const a of allowances ?? []) {
    const list = allowancesByEmployee.get(a.employee_id) ?? [];
    list.push({ id: a.id, label: a.label, amount: a.amount, active: a.active });
    allowancesByEmployee.set(a.employee_id, list);
  }

  const rows: EmployeeWithAllowances[] = (employees ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    allowances: allowancesByEmployee.get(e.id) ?? [],
  }));

  return <RecurringAllowancesClient businessId={businessId} employees={rows} />;
}
