"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null };

export async function createShiftTemplate(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = ((formData.get("name") as string) || "").trim();
  const startTime = formData.get("start_time") as string;
  const endTime = formData.get("end_time") as string;

  if (!name) return { error: "Nama shift wajib diisi." };
  if (!startTime || !endTime) return { error: "Jam mulai & selesai wajib diisi." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("shift_templates")
    .insert({ business_id: businessId, name, start_time: startTime, end_time: endTime });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/shifts`);
  return { error: null };
}

export async function deleteShiftTemplate(businessId: string, shiftTemplateId: string) {
  const supabase = await createClient();
  await supabase
    .from("shift_templates")
    .delete()
    .eq("id", shiftTemplateId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/shifts`);
}

export async function setWeeklySchedule(
  businessId: string,
  employeeId: string,
  weekday: number,
  shiftTemplateId: string | null,
) {
  const supabase = await createClient();

  if (!shiftTemplateId) {
    await supabase
      .from("employee_weekly_schedules")
      .delete()
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .eq("weekday", weekday);
  } else {
    await supabase.from("employee_weekly_schedules").upsert(
      { business_id: businessId, employee_id: employeeId, weekday, shift_template_id: shiftTemplateId },
      { onConflict: "employee_id,weekday" },
    );
  }

  revalidatePath(`/business/${businessId}/shifts/pola-mingguan`);
}

export type ApplyScheduleResult = { filled: number; error: string | null };

/**
 * Isi employee_shift_assignments untuk rentang tanggal dari pola mingguan —
 * cuma mengisi tanggal yang BELUM punya penugasan manual sama sekali (tidak
 * pernah menimpa yang sudah diatur manual di halaman Jadwal Shift harian).
 */
export async function applyWeeklySchedule(
  businessId: string,
  startDate: string,
  endDate: string,
): Promise<ApplyScheduleResult> {
  if (!startDate || !endDate || startDate > endDate) {
    return { filled: 0, error: "Rentang tanggal tidak valid." };
  }

  const supabase = await createClient();

  const [{ data: patterns }, { data: existing }] = await Promise.all([
    supabase
      .from("employee_weekly_schedules")
      .select("employee_id, weekday, shift_template_id")
      .eq("business_id", businessId)
      .not("shift_template_id", "is", null),
    supabase
      .from("employee_shift_assignments")
      .select("employee_id, date")
      .eq("business_id", businessId)
      .gte("date", startDate)
      .lte("date", endDate),
  ]);

  if (!patterns || patterns.length === 0) {
    return { filled: 0, error: "Belum ada pola mingguan yang diatur." };
  }

  const alreadyAssigned = new Set((existing ?? []).map((a) => `${a.employee_id}:${a.date}`));
  const byWeekday = new Map<number, { employee_id: string; shift_template_id: string }[]>();
  for (const p of patterns) {
    if (!p.shift_template_id) continue;
    const list = byWeekday.get(p.weekday) ?? [];
    list.push({ employee_id: p.employee_id, shift_template_id: p.shift_template_id });
    byWeekday.set(p.weekday, list);
  }

  const rows: { business_id: string; employee_id: string; date: string; shift_template_id: string }[] = [];
  const [sy, sm, sd] = startDate.split("-").map(Number);
  const [ey, em, ed] = endDate.split("-").map(Number);
  const cursor = new Date(Date.UTC(sy, sm - 1, sd));
  const end = new Date(Date.UTC(ey, em - 1, ed));
  while (cursor <= end) {
    const dateStr = cursor.toISOString().slice(0, 10);
    // ISO weekday: 1=Senin..7=Minggu — JS getUTCDay() 0=Minggu..6=Sabtu.
    const isoWeekday = cursor.getUTCDay() === 0 ? 7 : cursor.getUTCDay();
    for (const entry of byWeekday.get(isoWeekday) ?? []) {
      if (!alreadyAssigned.has(`${entry.employee_id}:${dateStr}`)) {
        rows.push({ business_id: businessId, employee_id: entry.employee_id, date: dateStr, shift_template_id: entry.shift_template_id });
      }
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  if (rows.length === 0) {
    return { filled: 0, error: null };
  }

  const { error } = await supabase
    .from("employee_shift_assignments")
    .upsert(rows, { onConflict: "employee_id,date" });

  if (error) return { filled: 0, error: error.message };

  revalidatePath(`/business/${businessId}/shifts`);
  return { filled: rows.length, error: null };
}

export async function setShiftAssignment(
  businessId: string,
  employeeId: string,
  date: string,
  shiftTemplateId: string | null,
) {
  const supabase = await createClient();

  if (!shiftTemplateId) {
    await supabase
      .from("employee_shift_assignments")
      .delete()
      .eq("business_id", businessId)
      .eq("employee_id", employeeId)
      .eq("date", date);
  } else {
    await supabase.from("employee_shift_assignments").upsert(
      { business_id: businessId, employee_id: employeeId, date, shift_template_id: shiftTemplateId },
      { onConflict: "employee_id,date" },
    );
  }

  revalidatePath(`/business/${businessId}/shifts`);
}
