"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CalculateCarryoverResult = { updated: number; error: string | null };

/**
 * Hitung carry-over ke targetYear dari sisa kuota tahun sebelumnya
 * (targetYear - 1): sisa = kuota tahun lalu (termasuk carry-over yang
 * sudah masuk ke tahun lalu) dikurangi hari yang sudah terpakai (disetujui
 * + cuti bersama), dibatasi oleh leave_types.max_carryover_days. Hasilnya
 * di-upsert ke leave_carryovers untuk targetYear — timpa hasil hitung
 * sebelumnya kalau dijalankan ulang.
 */
export async function calculateCarryover(businessId: string, targetYear: number): Promise<CalculateCarryoverResult> {
  if (!Number.isInteger(targetYear)) return { updated: 0, error: "Tahun tidak valid." };
  const sourceYear = targetYear - 1;

  const supabase = await createClient();

  const [{ data: employees }, { data: leaveTypes }, { data: priorCarryovers }, { data: approved }, { data: collective }] =
    await Promise.all([
      supabase
        .from("employees")
        .select("id")
        .eq("business_id", businessId)
        .eq("active", true)
        .is("deleted_at", null),
      supabase
        .from("leave_types")
        .select("id, default_days_per_year, max_carryover_days")
        .eq("business_id", businessId)
        .eq("active", true)
        .gt("max_carryover_days", 0),
      supabase
        .from("leave_carryovers")
        .select("employee_id, leave_type_id, days")
        .eq("business_id", businessId)
        .eq("year", sourceYear),
      supabase
        .from("leave_requests")
        .select("employee_id, leave_type_id, days_count")
        .eq("business_id", businessId)
        .eq("status", "approved")
        .gte("start_date", `${sourceYear}-01-01`)
        .lte("start_date", `${sourceYear}-12-31`),
      supabase
        .from("collective_leave_days")
        .select("leave_type_id")
        .eq("business_id", businessId)
        .not("leave_type_id", "is", null)
        .gte("date", `${sourceYear}-01-01`)
        .lte("date", `${sourceYear}-12-31`),
    ]);

  if (!leaveTypes || leaveTypes.length === 0) {
    return { updated: 0, error: "Belum ada jenis cuti dengan carry-over maks. > 0." };
  }
  if (!employees || employees.length === 0) {
    return { updated: 0, error: "Belum ada karyawan aktif." };
  }

  const priorMap = new Map((priorCarryovers ?? []).map((c) => [`${c.employee_id}:${c.leave_type_id}`, c.days]));
  const usedMap = new Map<string, number>();
  for (const r of approved ?? []) {
    const k = `${r.employee_id}:${r.leave_type_id}`;
    usedMap.set(k, (usedMap.get(k) ?? 0) + r.days_count);
  }
  const collectiveCountByType = new Map<string, number>();
  for (const c of collective ?? []) {
    if (!c.leave_type_id) continue;
    collectiveCountByType.set(c.leave_type_id, (collectiveCountByType.get(c.leave_type_id) ?? 0) + 1);
  }

  const rows: { business_id: string; employee_id: string; leave_type_id: string; year: number; days: number }[] = [];
  for (const emp of employees) {
    for (const lt of leaveTypes) {
      const key = `${emp.id}:${lt.id}`;
      const quota = lt.default_days_per_year + (priorMap.get(key) ?? 0);
      const used = (usedMap.get(key) ?? 0) + (collectiveCountByType.get(lt.id) ?? 0);
      const remaining = Math.max(0, quota - used);
      const days = Math.min(remaining, lt.max_carryover_days);
      rows.push({ business_id: businessId, employee_id: emp.id, leave_type_id: lt.id, year: targetYear, days });
    }
  }

  if (rows.length === 0) {
    return { updated: 0, error: null };
  }

  const { error } = await supabase
    .from("leave_carryovers")
    .upsert(rows, { onConflict: "employee_id,leave_type_id,year" });

  if (error) return { updated: 0, error: error.message };

  revalidatePath(`/business/${businessId}/leave-requests/carryover`);
  revalidatePath(`/business/${businessId}/leave-requests/balance`);
  return { updated: rows.length, error: null };
}
