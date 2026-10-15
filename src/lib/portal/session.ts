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

// Cookie sesi berlaku untuk seluruh situs (path "/") supaya /api/attendance-checkin
// juga menerimanya: karyawan yang sudah login portal tidak perlu PIN lagi saat
// absen selfie. Nama baru (bukan "absenku_portal" di path /karyawan) supaya
// cookie lama tidak bentrok; sesi lama cukup login ulang sekali.
const COOKIE_NAME = "hrcash_portal";
const COOKIE_PATH = "/";
const LEGACY_COOKIE_NAME = "absenku_portal";
const LEGACY_COOKIE_PATH = "/karyawan";
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
  store.set(LEGACY_COOKIE_NAME, "", { path: LEGACY_COOKIE_PATH, maxAge: 0 });
}

export async function clearPortalSession() {
  const store = await cookies();
  store.set(COOKIE_NAME, "", { path: COOKIE_PATH, maxAge: 0 });
  store.set(LEGACY_COOKIE_NAME, "", { path: LEGACY_COOKIE_PATH, maxAge: 0 });
}

export type PortalBusiness = {
  id: string;
  name: string;
  attendance_qr_slug: string;
  leave_request_slug: string | null;
  overtime_approval_required: boolean;
};

export type PortalEmployee = { id: string; name: string; note: string | null; photoPath: string | null };

export async function loadPortalBusiness(slug: string): Promise<PortalBusiness | null> {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("businesses")
    .select("id, name, attendance_qr_slug, leave_request_slug, overtime_approval_required")
    .eq("attendance_qr_slug", slug)
    .maybeSingle();
  return data;
}

type PortalCookie = { businessId: string; employeeId: string; expStr: string; sig: string };

async function readPortalCookie(): Promise<PortalCookie | null> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 4) return null;
  const [businessId, employeeId, expStr, sig] = parts;
  if (!(Number(expStr) > Math.floor(Date.now() / 1000))) return null;
  return { businessId, employeeId, expStr, sig };
}

async function fetchPortalEmployeeRow(businessId: string, employeeId: string) {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from("employees")
    .select("id, name, note, photo_path, attendance_pin_hash")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .eq("active", true)
    .is("deleted_at", null)
    .maybeSingle();
  return data;
}

function verifyPortalEmployee(
  c: PortalCookie,
  employee: NonNullable<Awaited<ReturnType<typeof fetchPortalEmployeeRow>>>,
): PortalEmployee | null {
  if (!employee.attendance_pin_hash) return null;
  const expected = Buffer.from(
    sign(`${c.businessId}.${c.employeeId}.${c.expStr}.${pinFingerprint(employee.attendance_pin_hash)}`),
  );
  const actual = Buffer.from(c.sig);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return null;
  return { id: employee.id, name: employee.name, note: employee.note, photoPath: employee.photo_path };
}

/**
 * Karyawan yang sedang login di portal bisnis ini, atau null kalau cookie
 * tidak ada / palsu / kedaluwarsa / untuk bisnis lain / PIN sudah diganti /
 * karyawan sudah nonaktif.
 */
export async function getPortalEmployee(business: PortalBusiness): Promise<PortalEmployee | null> {
  const c = await readPortalCookie();
  if (!c || c.businessId !== business.id) return null;
  const employee = await fetchPortalEmployeeRow(business.id, c.employeeId);
  return employee ? verifyPortalEmployee(c, employee) : null;
}

/**
 * Bisnis (dari slug) + karyawan sesi sekaligus, kedua query dijalankan
 * PARALEL — halaman portal sebelumnya menunggu bisnis dulu baru karyawan
 * (dua kali bolak-balik ke database). Aturan keamanannya sama dengan
 * getPortalEmployee: karyawan hanya sah kalau business id di cookie sama dengan
 * bisnis dari slug.
 */
export async function loadPortalContext(
  slug: string,
): Promise<{ business: PortalBusiness | null; employee: PortalEmployee | null }> {
  const c = await readPortalCookie();
  const [business, row] = await Promise.all([
    loadPortalBusiness(slug),
    c ? fetchPortalEmployeeRow(c.businessId, c.employeeId) : Promise.resolve(null),
  ]);
  if (!business) return { business: null, employee: null };
  if (!c || c.businessId !== business.id || !row) return { business, employee: null };
  return { business, employee: verifyPortalEmployee(c, row) };
}

/**
 * Apakah request ini membawa sesi portal yang sah untuk karyawan + bisnis ini?
 * Dipakai API absen: PIN sudah diperiksa saat login portal, jadi absen selfie
 * dari portal tidak meminta PIN lagi. Tanpa query database — tanda tangan HMAC
 * terikat ke id bisnis, id karyawan, waktu kedaluwarsa, dan hash PIN saat login
 * (PIN diganti = sesi tidak sah lagi).
 */
export async function hasPortalSessionFor(businessId: string, employeeId: string, pinHash: string): Promise<boolean> {
  const c = await readPortalCookie();
  if (!c || c.businessId !== businessId || c.employeeId !== employeeId) return false;
  const expected = Buffer.from(sign(`${c.businessId}.${c.employeeId}.${c.expStr}.${pinFingerprint(pinHash)}`));
  const actual = Buffer.from(c.sig);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
