"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/service";
import { checkEmployeePin } from "@/lib/attendance/pin-check";
import {
  clearPortalSession,
  getPortalEmployee,
  loadPortalBusiness,
  setPortalSession,
} from "@/lib/portal/session";
import { todayWib, addDays } from "@/lib/portal/dates";

export type PortalActionState = { error: string | null; success?: string | null };

export async function loginPortal(
  slug: string,
  _prevState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const employeeId = (formData.get("employee_id") as string | null) ?? "";
  const pin = ((formData.get("pin") as string | null) ?? "").trim();
  if (!employeeId) return { error: "Pilih nama kamu dulu." };

  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };

  const supabase = createServiceClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("id, attendance_pin_hash")
    .eq("id", employeeId)
    .eq("business_id", business.id)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!employee) return { error: "Karyawan tidak ditemukan/tidak aktif." };
  if (!employee.attendance_pin_hash) {
    return { error: "Kamu belum punya PIN. Minta admin memasangkan PIN absen dulu." };
  }

  const pinCheck = await checkEmployeePin(
    supabase,
    business.id,
    employee.id,
    employee.attendance_pin_hash,
    pin,
  );
  if (!pinCheck.ok) return { error: pinCheck.error };

  await setPortalSession(business.id, employee.id, employee.attendance_pin_hash);
  redirect(`/karyawan/${slug}`);
}

export async function logoutPortal(slug: string) {
  await clearPortalSession();
  redirect(`/karyawan/${slug}`);
}

const OVERTIME_COOLDOWN_MS = 30 * 1000;
const OVERTIME_MAX_AGE_DAYS = 31;

export async function submitOvertimeRequest(
  slug: string,
  _prevState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };
  const employee = await getPortalEmployee(business);
  if (!employee) return { error: "Sesi habis — masuk lagi dengan PIN." };
  if (!business.overtime_approval_required) {
    return { error: "Pengajuan lembur tidak aktif di bisnis ini." };
  }

  const date = (formData.get("date") as string | null) ?? "";
  const hours = Number(formData.get("hours") ?? 0);
  const reason = ((formData.get("reason") as string | null) ?? "").trim().slice(0, 300) || null;

  const today = todayWib();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  if (date > today) return { error: "Lembur tidak bisa diajukan untuk tanggal yang belum lewat." };
  if (date < addDays(today, -OVERTIME_MAX_AGE_DAYS)) {
    return { error: `Lembur hanya bisa diajukan maksimal ${OVERTIME_MAX_AGE_DAYS} hari ke belakang.` };
  }
  if (!(hours >= 0.5 && hours <= 12) || Math.round(hours * 2) !== hours * 2) {
    return { error: "Jam lembur harus 0,5–12 jam (kelipatan 0,5)." };
  }

  const supabase = createServiceClient();

  const { data: recent } = await supabase
    .from("public_submission_log")
    .select("id")
    .eq("business_id", business.id)
    .eq("kind", "lembur")
    .eq("employee_id", employee.id)
    .gte("created_at", new Date(Date.now() - OVERTIME_COOLDOWN_MS).toISOString())
    .limit(1)
    .maybeSingle();
  if (recent) return { error: "Tunggu sebentar sebelum mengajukan lagi." };

  const { data: existing } = await supabase
    .from("overtime_requests")
    .select("id")
    .eq("business_id", business.id)
    .eq("employee_id", employee.id)
    .eq("date", date)
    .neq("status", "rejected")
    .limit(1)
    .maybeSingle();
  if (existing) return { error: "Sudah ada pengajuan lembur untuk tanggal itu." };

  await supabase
    .from("public_submission_log")
    .insert({ business_id: business.id, kind: "lembur", employee_id: employee.id });

  const { error } = await supabase.from("overtime_requests").insert({
    business_id: business.id,
    employee_id: employee.id,
    date,
    hours,
    reason,
  });
  if (error) return { error: "Gagal mengirim pengajuan. Coba lagi." };

  revalidatePath(`/karyawan/${slug}`);
  return { error: null, success: "Pengajuan lembur terkirim — menunggu persetujuan admin." };
}
