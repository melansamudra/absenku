import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

/** ID karyawan berikutnya per bisnis: EMP00001, EMP00002, … */
export async function nextEmployeeCode(supabase: SupabaseClient<Database>, businessId: string) {
  const { data } = await supabase
    .from("employees")
    .select("employee_code")
    .eq("business_id", businessId)
    .like("employee_code", "EMP%")
    .order("employee_code", { ascending: false })
    .limit(1);
  const last = data?.[0]?.employee_code?.match(/^EMP(\d+)$/)?.[1];
  const next = (last ? parseInt(last, 10) : 0) + 1;
  return `EMP${String(next).padStart(5, "0")}`;
}
