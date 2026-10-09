"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type TaskActionState = { error: string | null };

export async function createTask(
  businessId: string,
  _prevState: TaskActionState,
  formData: FormData,
): Promise<TaskActionState> {
  const employeeId = (formData.get("employee_id") as string) || "";
  const title = ((formData.get("title") as string) || "").trim().slice(0, 200);
  const description = ((formData.get("description") as string) || "").trim().slice(0, 1000) || null;
  const dueDate = ((formData.get("due_date") as string) || "") || null;

  if (!employeeId) return { error: "Pilih karyawan dulu." };
  if (!title) return { error: "Judul tugas wajib diisi." };
  if (dueDate && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate)) return { error: "Tenggat tidak valid." };

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("name")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!employee) return { error: "Karyawan tidak ditemukan/tidak aktif." };

  const { error } = await supabase.from("employee_tasks").insert({
    business_id: businessId,
    employee_id: employeeId,
    title,
    description,
    due_date: dueDate,
  });
  if (error) return { error: error.message };

  await logActivity(supabase, businessId, "Tugas dibuat", `${employee.name} · ${title}`);
  revalidatePath(`/business/${businessId}/tasks`);
  return { error: null };
}

export async function setTaskStatus(
  businessId: string,
  taskId: string,
  status: "todo" | "in_progress" | "done",
) {
  const supabase = await createClient();
  await supabase
    .from("employee_tasks")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", taskId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/tasks`);
}

export async function deleteTask(businessId: string, taskId: string) {
  const supabase = await createClient();
  await supabase.from("employee_tasks").delete().eq("id", taskId).eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/tasks`);
}
