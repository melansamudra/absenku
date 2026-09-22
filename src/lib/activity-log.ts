import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Best-effort — dipanggil SETELAH aksi utamanya berhasil, jadi kegagalan
// nulis log (mis. RLS lolos tapi network putus) tidak pernah menggagalkan
// aksi yang sedang dicatat. Actor diambil dari sesi yang sedang login;
// dipanggil dari action yang sudah tahu businessId, jadi tidak perlu query
// ulang businesses di sini.
export async function logActivity(
  supabase: SupabaseServerClient,
  businessId: string,
  action: string,
  detail?: string,
) {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("activity_log").insert({
      business_id: businessId,
      actor: user?.email ?? "Admin",
      action,
      detail: detail ?? null,
    });
  } catch {
    // Sengaja ditelan — lihat komentar di atas.
  }
}
