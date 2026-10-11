import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database, Tables } from "@/lib/types/database";

type Sb = SupabaseClient<Database>;

export type SalarySnapshot = Pick<
  Tables<"employees">,
  "salary_type" | "daily_rate" | "monthly_rate" | "daily_meal_allowance" | "daily_attendance_allowance"
>;

const today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

const sameSalary = (a: SalarySnapshot, b: SalarySnapshot) =>
  a.salary_type === b.salary_type &&
  Number(a.daily_rate) === Number(b.daily_rate) &&
  Number(a.monthly_rate) === Number(b.monthly_rate) &&
  Number(a.daily_meal_allowance) === Number(b.daily_meal_allowance) &&
  Number(a.daily_attendance_allowance) === Number(b.daily_attendance_allowance);

/**
 * Catat riwayat gaji. Baris pertama selalu dibuat (gaji awal); selanjutnya hanya
 * kalau ada yang berubah dari `before`. Gagal mencatat tidak boleh menggagalkan simpan data.
 */
export async function recordSalaryChange(
  supabase: Sb,
  businessId: string,
  employeeId: string,
  before: SalarySnapshot | null,
  after: SalarySnapshot,
  effectiveDate: string | null,
  note: string | null = null,
) {
  const { count } = await supabase
    .from("salary_history")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("business_id", businessId);

  const isFirst = (count ?? 0) === 0;
  if (!isFirst && before && sameSalary(before, after)) return;

  await supabase.from("salary_history").insert({
    business_id: businessId,
    employee_id: employeeId,
    effective_date: effectiveDate ?? today(),
    salary_type: after.salary_type,
    daily_rate: after.daily_rate,
    monthly_rate: after.monthly_rate,
    daily_meal_allowance: after.daily_meal_allowance,
    daily_attendance_allowance: after.daily_attendance_allowance,
    note: note ?? (isFirst ? "Gaji awal" : null),
  });
}

export type CareerSnapshot = {
  employment_status: string | null;
  placement_type: string | null;
  organization_id: string | null;
  position_id: string | null;
  rank_id: string | null;
};

/** Catat riwayat karir (snapshot nama master). Hanya bila ada perubahan atau belum ada riwayat. */
export async function recordCareerChange(
  supabase: Sb,
  businessId: string,
  employeeId: string,
  before: CareerSnapshot | null,
  after: CareerSnapshot,
  effectiveDate: string | null,
) {
  const { count } = await supabase
    .from("career_history")
    .select("id", { count: "exact", head: true })
    .eq("employee_id", employeeId)
    .eq("business_id", businessId);

  const isFirst = (count ?? 0) === 0;
  const unchanged =
    !!before &&
    before.employment_status === after.employment_status &&
    before.placement_type === after.placement_type &&
    before.organization_id === after.organization_id &&
    before.position_id === after.position_id &&
    before.rank_id === after.rank_id;
  if (!isFirst && unchanged) return;

  const name = async (table: "organizations" | "positions" | "ranks", id: string | null) => {
    if (!id) return null;
    const { data } = await supabase.from(table).select("name").eq("id", id).eq("business_id", businessId).maybeSingle();
    return data?.name ?? null;
  };
  const [organization_name, position_name, rank_name] = await Promise.all([
    name("organizations", after.organization_id),
    name("positions", after.position_id),
    name("ranks", after.rank_id),
  ]);

  await supabase.from("career_history").insert({
    business_id: businessId,
    employee_id: employeeId,
    effective_date: effectiveDate ?? today(),
    employment_status: after.employment_status,
    placement_type: after.placement_type,
    organization_name,
    position_name,
    rank_name,
  });
}
