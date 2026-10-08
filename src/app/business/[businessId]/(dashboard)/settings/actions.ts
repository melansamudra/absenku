"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

function optionalNumber(v: FormDataEntryValue | null): number | null | "invalid" {
  const raw = ((v as string | null) ?? "").trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : "invalid";
}

export async function updateBusinessSettings(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();

  const name = (formData.get("name") as string)?.trim();
  const izinDeductionMode = formData.get("izin_deduction_mode") as string;

  if (!name) return { error: "Nama bisnis wajib diisi." };
  if (izinDeductionMode !== "flat" && izinDeductionMode !== "full_day") {
    return { error: "Mode potongan izin tidak valid." };
  }

  // Geofence absen: ketiganya diisi semua (aktif) atau dikosongkan semua (mati).
  const officeLat = optionalNumber(formData.get("office_lat"));
  const officeLng = optionalNumber(formData.get("office_lng"));
  const radius = optionalNumber(formData.get("attendance_radius_m"));
  if (officeLat === "invalid" || officeLng === "invalid" || radius === "invalid") {
    return { error: "Lokasi kantor / radius harus berupa angka." };
  }
  const geofenceFields = [officeLat, officeLng, radius].filter((v) => v !== null).length;
  if (geofenceFields !== 0 && geofenceFields !== 3) {
    return { error: "Isi latitude, longitude, dan radius sekaligus — atau kosongkan ketiganya." };
  }
  if (officeLat !== null && (officeLat < -90 || officeLat > 90)) {
    return { error: "Latitude harus di antara -90 dan 90." };
  }
  if (officeLng !== null && (officeLng < -180 || officeLng > 180)) {
    return { error: "Longitude harus di antara -180 dan 180." };
  }
  if (radius !== null && (!Number.isInteger(radius) || radius < 10 || radius > 10000)) {
    return { error: "Radius absen harus bilangan bulat 10–10.000 meter." };
  }

  const { error } = await supabase
    .from("businesses")
    .update({
      name,
      address: ((formData.get("address") as string) || "").trim() || null,
      phone: ((formData.get("phone") as string) || "").trim() || null,
      work_start_time: formData.get("work_start_time") as string,
      work_end_time: formData.get("work_end_time") as string,
      izin_deduction_mode: izinDeductionMode,
      izin_deduction_weekday: Number(formData.get("izin_deduction_weekday") ?? 0),
      izin_deduction_weekend: Number(formData.get("izin_deduction_weekend") ?? 0),
      late_deduction_per_occurrence: Number(formData.get("late_deduction_per_occurrence") ?? 0),
      lembur_rate_per_hour: Number(formData.get("lembur_rate_per_hour") ?? 0),
      pph21_enabled: formData.get("pph21_enabled") === "on",
      office_lat: officeLat,
      office_lng: officeLng,
      attendance_radius_m: radius,
      attendance_pin_required: formData.get("attendance_pin_required") === "on",
    })
    .eq("id", businessId);

  if (error) return { error: error.message };

  await logActivity(supabase, businessId, "Pengaturan bisnis diubah");

  revalidatePath(`/business/${businessId}/settings`);
  return { error: null };
}
