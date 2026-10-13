import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

// Satu-satunya pintu masuk ke service-role client untuk konteks user yang
// sedang login (beda dari src/lib/supabase/service.ts yang dipakai di jalur
// publik tanpa sesi). Dipakai khusus halaman /admin — tempat admin platform
// (bukan owner bisnis mana pun) perlu lihat & ubah semua bisnis lintas owner,
// yang RLS normal tidak izinkan. Akses dibatasi daftar email di env
// PLATFORM_ADMIN_EMAILS; selain itu di-redirect, tidak pernah dapat client ini.
function adminEmails(): string[] {
  return (process.env.PLATFORM_ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export async function requirePlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const email = user?.email?.toLowerCase();
  if (!email || !adminEmails().includes(email)) {
    redirect("/dashboard");
  }

  return createServiceClient();
}
