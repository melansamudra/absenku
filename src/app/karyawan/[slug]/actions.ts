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
import { REIMBURSEMENT_CATEGORIES } from "@/lib/reimbursement/categories";

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

const CLAIM_COOLDOWN_MS = 30 * 1000;
const CLAIM_MAX_AGE_DAYS = 90;
const CLAIM_MAX_AMOUNT = 50_000_000;

export async function submitReimbursement(
  slug: string,
  _prevState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };
  const employee = await getPortalEmployee(business);
  if (!employee) return { error: "Sesi habis — masuk lagi dengan PIN." };

  const date = (formData.get("date") as string | null) ?? "";
  const category = (formData.get("category") as string | null) ?? "";
  const amount = Number(formData.get("amount") ?? 0);
  const description = ((formData.get("description") as string | null) ?? "").trim().slice(0, 300) || null;

  const today = todayWib();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  if (date > today) return { error: "Tanggal pengeluaran tidak boleh di masa depan." };
  if (date < addDays(today, -CLAIM_MAX_AGE_DAYS)) {
    return { error: `Klaim hanya bisa diajukan maksimal ${CLAIM_MAX_AGE_DAYS} hari ke belakang.` };
  }
  if (!(category in REIMBURSEMENT_CATEGORIES)) return { error: "Kategori tidak valid." };
  if (!Number.isFinite(amount) || amount < 1 || amount > CLAIM_MAX_AMOUNT) {
    return { error: "Nominal harus antara Rp1 dan Rp50.000.000." };
  }
  if (!description) return { error: "Isi keterangan pengeluaran." };

  const supabase = createServiceClient();

  const { data: recent } = await supabase
    .from("public_submission_log")
    .select("id")
    .eq("business_id", business.id)
    .eq("kind", "klaim")
    .eq("employee_id", employee.id)
    .gte("created_at", new Date(Date.now() - CLAIM_COOLDOWN_MS).toISOString())
    .limit(1)
    .maybeSingle();
  if (recent) return { error: "Tunggu sebentar sebelum mengajukan lagi." };

  await supabase
    .from("public_submission_log")
    .insert({ business_id: business.id, kind: "klaim", employee_id: employee.id });

  const { error } = await supabase.from("reimbursements").insert({
    business_id: business.id,
    employee_id: employee.id,
    date,
    category,
    amount: Math.round(amount),
    description,
  });
  if (error) return { error: "Gagal mengirim klaim. Coba lagi." };

  revalidatePath(`/karyawan/${slug}`);
  return { error: null, success: "Klaim terkirim — menunggu persetujuan admin." };
}

const ACTIVITY_COOLDOWN_MS = 10 * 1000;
const ACTIVITY_MAX_AGE_DAYS = 7;

export async function submitActivity(
  slug: string,
  _prevState: PortalActionState,
  formData: FormData,
): Promise<PortalActionState> {
  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };
  const employee = await getPortalEmployee(business);
  if (!employee) return { error: "Sesi habis — masuk lagi dengan PIN." };

  const date = (formData.get("date") as string | null) ?? "";
  const title = ((formData.get("title") as string | null) ?? "").trim().slice(0, 150);
  const description = ((formData.get("description") as string | null) ?? "").trim().slice(0, 500) || null;

  const today = todayWib();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Tanggal tidak valid." };
  if (date > today) return { error: "Tanggal kegiatan tidak boleh di masa depan." };
  if (date < addDays(today, -ACTIVITY_MAX_AGE_DAYS)) {
    return { error: `Kegiatan hanya bisa dilaporkan maksimal ${ACTIVITY_MAX_AGE_DAYS} hari ke belakang.` };
  }
  if (!title) return { error: "Tulis kegiatan yang kamu lakukan." };

  const supabase = createServiceClient();

  const { data: recent } = await supabase
    .from("public_submission_log")
    .select("id")
    .eq("business_id", business.id)
    .eq("kind", "kegiatan")
    .eq("employee_id", employee.id)
    .gte("created_at", new Date(Date.now() - ACTIVITY_COOLDOWN_MS).toISOString())
    .limit(1)
    .maybeSingle();
  if (recent) return { error: "Tunggu sebentar sebelum melapor lagi." };

  await supabase
    .from("public_submission_log")
    .insert({ business_id: business.id, kind: "kegiatan", employee_id: employee.id });

  const { error } = await supabase.from("employee_activities").insert({
    business_id: business.id,
    employee_id: employee.id,
    date,
    title,
    description,
  });
  if (error) return { error: "Gagal menyimpan kegiatan. Coba lagi." };

  revalidatePath(`/karyawan/${slug}`);
  return { error: null, success: "Kegiatan tersimpan." };
}

export async function updateTaskStatus(
  slug: string,
  taskId: string,
  status: "todo" | "in_progress" | "done",
) {
  if (status !== "todo" && status !== "in_progress" && status !== "done") return;
  const business = await loadPortalBusiness(slug);
  if (!business) return;
  const employee = await getPortalEmployee(business);
  if (!employee) return;

  const supabase = createServiceClient();
  await supabase
    .from("employee_tasks")
    .update({ status, completed_at: status === "done" ? new Date().toISOString() : null })
    .eq("id", taskId)
    .eq("business_id", business.id)
    .eq("employee_id", employee.id);

  revalidatePath(`/karyawan/${slug}`);
}

const PHOTO_MAX_BYTES = 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Foto sudah diperkecil di browser (±480px JPEG); server tetap memeriksa tipe
// dan ukuran. Foto lama dihapus setelah yang baru tersimpan.
export async function uploadProfilePhoto(slug: string, formData: FormData): Promise<PortalActionState> {
  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };
  const employee = await getPortalEmployee(business);
  if (!employee) return { error: "Sesi habis — masuk lagi dengan PIN." };

  const file = formData.get("photo");
  if (!(file instanceof File) || file.size === 0) return { error: "Pilih foto dulu." };
  if (!PHOTO_TYPES.includes(file.type)) return { error: "Format foto harus JPG, PNG, atau WEBP." };
  if (file.size > PHOTO_MAX_BYTES) return { error: "Ukuran foto maksimal 1 MB." };

  const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${business.id}/${employee.id}/${crypto.randomUUID()}.${ext}`;

  const supabase = createServiceClient();
  const { error: uploadError } = await supabase.storage
    .from("employee-photos")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (uploadError) return { error: "Gagal mengunggah foto. Coba lagi." };

  const { error: updateError } = await supabase
    .from("employees")
    .update({ photo_path: path })
    .eq("id", employee.id)
    .eq("business_id", business.id);
  if (updateError) {
    await supabase.storage.from("employee-photos").remove([path]);
    return { error: "Gagal menyimpan foto. Coba lagi." };
  }

  if (employee.photoPath) await supabase.storage.from("employee-photos").remove([employee.photoPath]);

  revalidatePath(`/karyawan/${slug}`);
  return { error: null, success: "Foto profil diperbarui." };
}

export async function removeProfilePhoto(slug: string): Promise<PortalActionState> {
  const business = await loadPortalBusiness(slug);
  if (!business) return { error: "Link portal tidak valid." };
  const employee = await getPortalEmployee(business);
  if (!employee) return { error: "Sesi habis — masuk lagi dengan PIN." };
  if (!employee.photoPath) return { error: null };

  const supabase = createServiceClient();
  await supabase
    .from("employees")
    .update({ photo_path: null })
    .eq("id", employee.id)
    .eq("business_id", business.id);
  await supabase.storage.from("employee-photos").remove([employee.photoPath]);

  revalidatePath(`/karyawan/${slug}`);
  return { error: null, success: "Foto profil dihapus." };
}
