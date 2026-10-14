import type { createClient } from "@/lib/supabase/server";

// Bucket `attendance-selfies` privat — kolom attendance.*_photo_url menyimpan
// path objek, dan dashboard membuat signed URL berumur pendek saat halaman
// dirender (lewat client owner yang login, dicek policy storage
// owns_business()).
const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function signSelfieUrls(
  supabase: Awaited<ReturnType<typeof createClient>>,
  paths: (string | null | undefined)[],
): Promise<Map<string, string>> {
  const unique = [...new Set(paths.filter((p): p is string => !!p))];
  const result = new Map<string, string>();
  if (unique.length === 0) return result;

  const { data } = await supabase.storage
    .from("attendance-selfies")
    .createSignedUrls(unique, SIGNED_URL_TTL_SECONDS);

  for (const item of data ?? []) {
    if (item.path && item.signedUrl) result.set(item.path, item.signedUrl);
  }
  return result;
}

// Retensi foto selfie: dihapus segera setelah presensi disetujui admin, dan
// paling lambat SELFIE_RETENTION_DAYS hari setelah tanggal absen kalau belum
// pernah disetujui (mis. admin lupa buka halaman Persetujuan).
export const SELFIE_RETENTION_DAYS = 30;

// Tanggal absen (YYYY-MM-DD) paling baru yang fotonya sudah boleh dihapus.
export function selfieRetentionCutoff(now: Date = new Date()): string {
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  d.setUTCDate(d.getUTCDate() - SELFIE_RETENTION_DAYS);
  return d.toISOString().slice(0, 10);
}

type PhotoColumns = {
  id: string;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
};

// Hapus file foto dari bucket lalu kosongkan kolom path-nya. Kolom hanya
// dikosongkan kalau file berhasil dihapus, supaya tidak ada file yatim yang
// tak terlacak. Dipakai oleh server action (client owner, dibatasi RLS/policy
// storage) dan oleh cron (service-role).
export async function purgeSelfies(
  supabase: Pick<Awaited<ReturnType<typeof createClient>>, "storage" | "from">,
  rows: PhotoColumns[],
): Promise<number> {
  const withPhoto = rows.filter((r) => r.check_in_photo_url || r.check_out_photo_url);
  if (withPhoto.length === 0) return 0;

  const paths = withPhoto.flatMap((r) => [r.check_in_photo_url, r.check_out_photo_url]).filter((p): p is string => !!p);
  const { error } = await supabase.storage.from("attendance-selfies").remove(paths);
  if (error) return 0;

  const { error: updateError } = await supabase
    .from("attendance")
    .update({ check_in_photo_url: null, check_out_photo_url: null })
    .in("id", withPhoto.map((r) => r.id));
  return updateError ? 0 : withPhoto.length;
}
