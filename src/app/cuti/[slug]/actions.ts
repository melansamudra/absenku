"use server";

import { createClient } from "@/lib/supabase/server";

export type ActionState = { error: string | null; success: boolean };

export async function submitLeaveRequest(
  slug: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const employeeId = formData.get("employee_id") as string;
  const leaveTypeId = formData.get("leave_type_id") as string;
  const startDate = formData.get("start_date") as string;
  const endDate = formData.get("end_date") as string;
  const reason = ((formData.get("reason") as string) || "").trim() || null;

  if (!employeeId || !leaveTypeId) return { error: "Pilih nama & jenis cuti dulu.", success: false };
  if (!startDate || !endDate) return { error: "Tanggal wajib diisi.", success: false };
  if (endDate < startDate) return { error: "Tanggal selesai harus setelah tanggal mulai.", success: false };

  const supabase = await createClient();
  const { error } = await supabase.rpc("submit_leave_request_public", {
    p_slug: slug,
    p_employee_id: employeeId,
    p_leave_type_id: leaveTypeId,
    p_start_date: startDate,
    p_end_date: endDate,
    // Tipe hasil generate Supabase menandai parameter RPC ini wajib string
    // (bukan mencerminkan nullability kolom sungguhan di database) — kolom
    // leave_requests.reason memang nullable, dan fungsi SQL-nya menerima
    // NULL dengan benar.
    p_reason: reason as string,
  });

  if (error) return { error: error.message, success: false };

  return { error: null, success: true };
}
