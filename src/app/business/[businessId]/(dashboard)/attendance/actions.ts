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
    })
    .eq("id", attendanceId)
    .eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
}

export async function clearAttendance(businessId: string, attendanceId: string) {
  const supabase = await createClient();
  await supabase.from("attendance").delete().eq("id", attendanceId).eq("business_id", businessId);
  revalidatePath(`/business/${businessId}/attendance`);
}
