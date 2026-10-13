import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// "owner" = pemilik bisnis (akses penuh, sama seperti sebelum role ada).
// "admin" (staff) = akses penuh juga, setara owner untuk operasional sehari-hari.
// "hr" = semua KECUALI data finansial/konfigurasi bisnis (Payroll, Laporan, Pengaturan).
// "staff" = sama seperti hr, DITAMBAH tidak bisa buka Karyawan (ada gaji pokok/NIK/rekening di situ).
export type BusinessRole = "owner" | "admin" | "hr" | "staff";

export async function getBusinessRole(
  supabase: SupabaseServerClient,
  businessId: string,
  userId: string,
): Promise<BusinessRole | null> {
  const { data: business } = await supabase
    .from("businesses")
    .select("owner_id")
    .eq("id", businessId)
    .maybeSingle();

  if (!business) return null;
  if (business.owner_id === userId) return "owner";

  const { data: staff } = await supabase
    .from("business_staff")
    .select("role, active")
    .eq("business_id", businessId)
    .eq("user_id", userId)
    .maybeSingle();

  if (!staff || !staff.active) return null;
  return staff.role as BusinessRole;
}

export function canAccessFinance(role: BusinessRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canAccessEmployeeMaster(role: BusinessRole | null): boolean {
  return role === "owner" || role === "admin" || role === "hr";
}
