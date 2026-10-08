"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type OvertimeActionState = { error: string | null };

// Lembur disetujui → jam lembur ditulis ke attendance.overtime_hours tanggal
// itu, dan dari sana ikut terhitung di rekap payroll lewat jalur yang sudah
// ada (lib/payroll/aggregate.ts) — tidak ada logic payroll baru. Butuh baris
// absensi berstatus 'hadir' di tanggal tsb (lembur tanpa hadir tidak masuk akal
// dan tidak akan terhitung oleh aggregate).
export async function approveOvertimeRequest(
  businessId: string,
  requestId: string,
  _prevState: OvertimeActionState,
  formData: FormData,
): Promise<OvertimeActionState> {
  const hours = Number(formData.get("hours") ?? 0);
  if (!(hours > 0 && hours <= 12)) return { error: "Jam lembur harus 0–12 jam." };

  const supabase = await createClient();
  const { data: request } = await supabase
    .from("overtime_requests")
    .select("employee_id, date, status, employees(name)")
    .eq("id", requestId)
    .eq("business_id", businessId)
    .single();
  if (!request) return { error: "Pengajuan tidak ditemukan." };
  if (request.status !== "pending") return { error: "Pengajuan ini sudah diproses." };

  const { data: attendance } = await supabase
    .from("attendance")
    .select("id, status")
    .eq("business_id", businessId)
    .eq("employee_id", request.employee_id)
    .eq("date", request.date)
    .maybeSingle();
  if (!attendance || attendance.status !== "hadir") {
    return {
      error: `Belum ada absensi "hadir" di ${request.date}. Isi absensinya dulu di menu Absensi, lalu setujui lagi.`,
    };
  }

  const { error: attendanceError } = await supabase
    .from("attendance")
    .update({ overtime_hours: hours })
    .eq("id", attendance.id);
  if (attendanceError) return { error: attendanceError.message };

  await supabase
    .from("overtime_requests")
    .update({ status: "approved", hours, reviewed_at: new Date().toISOString() })
    .eq("id", requestId)
    .eq("business_id", businessId)
    .eq("status", "pending");

  const employeeName = (request.employees as unknown as { name: string } | null)?.name ?? "—";
  await logActivity(supabase, businessId, "Lembur disetujui", `${employeeName} · ${request.date} · ${hours} jam`);

  revalidatePath(`/business/${businessId}/overtime`);
  return { error: null };
}

export async function rejectOvertimeRequest(
  businessId: string,
  requestId: string,
  _prevState: OvertimeActionState,
  formData: FormData,
): Promise<OvertimeActionState> {
  const note = ((formData.get("note") as string) || "").trim().slice(0, 300) || null;
  const supabase = await createClient();

  const { data: request } = await supabase
    .from("overtime_requests")
    .select("date, status, employees(name)")
    .eq("id", requestId)
    .eq("business_id", businessId)
    .single();
  if (!request) return { error: "Pengajuan tidak ditemukan." };
  if (request.status !== "pending") return { error: "Pengajuan ini sudah diproses." };

  await supabase
    .from("overtime_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_note: note })
    .eq("id", requestId)
    .eq("business_id", businessId)
    .eq("status", "pending");

  const employeeName = (request.employees as unknown as { name: string } | null)?.name ?? "—";
  await logActivity(supabase, businessId, "Lembur ditolak", `${employeeName} · ${request.date}`);

  revalidatePath(`/business/${businessId}/overtime`);
  return { error: null };
}
