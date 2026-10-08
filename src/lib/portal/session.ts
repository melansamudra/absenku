import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/service";

// Sesi Portal Karyawan (/karyawan/[slug]). Karyawan tidak punya akun Supabase
// Auth, jadi "login" = pilih nama + PIN absen, lalu server menyimpan cookie
// httpOnly bertanda tangan HMAC berisi business id, employee id, dan waktu
// kedaluwarsa. Tanda tangan juga mengikat hash PIN saat login, sehingga
// mengganti/menghapus PIN karyawan otomatis membatalkan sesi lamanya.
//
// Semua data portal dibaca lewat service-role client (tidak ada sesi Supabase
// untuk RLS), jadi SETIAP query di portal wajib di-scope manual ke
// business_id + employee_id dari sesi yang sudah diverifikasi di sini.

const COOKIE_NAME = "absenku_portal";
const COOKIE_PATH = "/karyawan";
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function secret(): string {
  const explicit = process.env.PORTAL_SESSION_SECRET;
  if (explicit) return explicit;
  // Turunan dari service role key supaya tidak perlu env var baru; key itu
  // sendiri rahasia server, jadi turunannya juga.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi.");
  return createHmac("sha256", serviceKey).update("absenku-portal-session-v1").digest("hex");
}

function pinFingerprint(pinHash: string) {
  return createHash("sha256").update(pinHash).digest("hex").slice(0, 16);
}

function sign(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("base64url");
}

export async function setPortalSession(businessId: string, employeeId: string, pinHash: string) {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const payload = `${businessId}.${employeeId}.${exp}`;
  const sig = sign(`${payload}.${pinFingerprint(pinHash)}`);
  const store = await cookies();
  store.set(COOKIE_NAME, `${payload}.${sig}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function clearPortalSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: COOKIE_PATH, maxAge: 0 });
}

export type PortalBusiness = {
  id: string;
  name: string;
  attendance_qr_slug: string;
  leave_request_slug: string | null;
  overtime_approval_required: boolean;
};

export type PortalEmployee = { id: string; name: string; note: string | null };

export async function loadPortalBusiness(slug: string): Promise<PortalBusiness | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, attendance_qr_slug, leave_request_slug, overtime_approval_required")
    .eq("attendance_qr_slug", slug)
    .maybeSingle();
  return data;
}

/**
 * Karyawan yang sedang login di portal bisnis ini, atau null kalau cookie
 * tidak ada / palsu / kedaluwarsa / untuk bisnis lain / PIN sudah diganti /
 * karyawan sudah nonaktif.
 */
export async function getPortalEmployee(business: PortalBusiness): Promise<PortalEmployee | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;

  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [businessId, employeeId, expStr, sig] = parts;
  if (businessId !== business.id) return null;
  if (!(Number(expStr) > Math.floor(Date.now() / 1000))) return null;

  const supabase = createServiceClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("id, name, note, attendance_pin_hash")
    .eq("id", employeeId)
    .eq("business_id", business.id)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  if (!employee?.attendance_pin_hash) return null;

  const expected = Buffer.from(
    sign(`${businessId}.${employeeId}.${expStr}.${pinFingerprint(employee.attendance_pin_hash)}`),
  );
  const actual = Buffer.from(sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;

  return { id: employee.id, name: employee.name, note: employee.note };
}
