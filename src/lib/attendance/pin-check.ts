import type { createServiceClient } from "@/lib/supabase/service";
import { verifyPin } from "./pin";

// Cek PIN absen karyawan + kunci sementara setelah beberapa kali salah —
// dipakai bersama oleh API absen selfie dan login Portal Karyawan, jadi
// tebakan PIN di kedua tempat dihitung ke kuota gagal yang sama.
// PIN cuma 4–6 digit, jadi tanpa kunci ini bisa ditebak lewat brute force.
const PIN_MAX_FAILURES = 5;
const PIN_LOCK_WINDOW_MS = 15 * 60 * 1000;

type ServiceClient = ReturnType<typeof createServiceClient>;

export type PinCheckResult = { ok: true } | { ok: false; error: string; status: number };

export async function checkEmployeePin(
  supabase: ServiceClient,
  businessId: string,
  employeeId: string,
  pinHash: string,
  pin: string,
): Promise<PinCheckResult> {
  const { count: recentFailures } = await supabase
    .from("public_submission_log")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .eq("kind", "absen_pin_gagal")
    .eq("employee_id", employeeId)
    .gte("created_at", new Date(Date.now() - PIN_LOCK_WINDOW_MS).toISOString());

  if ((recentFailures ?? 0) >= PIN_MAX_FAILURES) {
    return {
      ok: false,
      error: "PIN salah terlalu sering. Coba lagi 15 menit lagi atau hubungi admin.",
      status: 429,
    };
  }
  if (!pin) return { ok: false, error: "Masukkan PIN absen kamu.", status: 400 };

  if (!(await verifyPin(pin, pinHash))) {
    await supabase
      .from("public_submission_log")
      .insert({ business_id: businessId, kind: "absen_pin_gagal", employee_id: employeeId });
    return { ok: false, error: "PIN salah.", status: 403 };
  }
  return { ok: true };
}
