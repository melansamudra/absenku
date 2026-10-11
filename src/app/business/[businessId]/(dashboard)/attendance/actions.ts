"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type AttendanceStatus = "hadir" | "izin" | "sakit" | "alpa" | "off";

export async function setAttendanceStatus(
  businessId: string,
  employeeId: string,
  date: string,
  status: AttendanceStatus,
  note: string | null,
) {
  const supabase = await createClient();
  await supabase.from("attendance").upsert(
    { business_id: businessId, employee_id: employeeId, date, status, note },
    { onConflict: "employee_id,date" },
  );
  revalidatePath(`/business/${businessId}/attendance`);
}

export async function setAttendanceLate(
  businessId: string,
  attendanceId: string,
  late: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("attendance")
    .update({ late, late_minutes: late ? 1 : 0 })
    .eq("id", attendanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
}

export async function setAttendanceVerified(
  businessId: string,
  attendanceId: string,
  verified: boolean,
) {
  const supabase = await createClient();
  await supabase
    .from("attendance")
    .update({
      verified_by_admin: verified,
      verified_at: verified ? new Date().toISOString() : null,
      // Menyetujui membatalkan penolakan sebelumnya.
      ...(verified && { rejected_at: null, rejected_note: null }),
    })
    .eq("id", attendanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
  revalidatePath(`/business/${businessId}/attendance/approval`);
}

// Tolak presensi: dicatat sebagai alpa supaya hitungan payroll tetap konsisten.
export async function rejectAttendance(businessId: string, attendanceId: string, note: string) {
  const supabase = await createClient();
  await supabase
    .from("attendance")
    .update({
      rejected_at: new Date().toISOString(),
      rejected_note: note.trim() || null,
      verified_by_admin: false,
      verified_at: null,
      status: "alpa",
    })
    .eq("id", attendanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
  revalidatePath(`/business/${businessId}/attendance/approval`);
}

export async function clearAttendance(businessId: string, attendanceId: string) {
  const supabase = await createClient();
  await supabase.from("attendance").delete().eq("id", attendanceId).eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
}
