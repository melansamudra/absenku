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
