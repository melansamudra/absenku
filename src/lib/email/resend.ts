import { Resend } from "resend";

// Notifikasi email bersifat opsional (tidak wajib supaya ABSENKU tetap bisa
// dipakai sebelum admin sempat setup Resend) — kalau RESEND_API_KEY belum
// diisi, getResendClient() return null dan pemanggil cukup skip pengiriman
// tanpa error, bukan melempar exception yang bisa menggagalkan approve/reject
// cuti (yang jauh lebih penting daripada notifikasinya).
export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export function getFromAddress() {
  // onboarding@resend.dev cuma buat testing (tanpa verifikasi domain sendiri)
  // — untuk produksi, verifikasi domain sendiri di Resend lalu set
  // RESEND_FROM_EMAIL ke alamat dari domain itu.
  return process.env.RESEND_FROM_EMAIL || "ABSENKU <onboarding@resend.dev>";
}
