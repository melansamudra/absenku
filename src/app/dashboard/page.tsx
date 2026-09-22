import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Halaman transit: ABSENKU (beda dengan KasirKu) tidak punya konsep "multi
// outlet dipilih dari satu dashboard" untuk v1 — satu owner biasanya cuma
// urus satu bisnis. /dashboard cuma menentukan bisnis mana yang relevan buat
// user yang login, lalu redirect ke /business/[businessId].
export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: owned } = await supabase
    .from("businesses")
    .select("id")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (owned) {
    redirect(`/business/${owned.id}`);
  }

  const { data: staffRow } = await supabase
    .from("business_staff")
    .select("business_id")
    .eq("user_id", user.id)
    .eq("active", true)
    .limit(1)
    .maybeSingle();

  if (staffRow) {
    redirect(`/business/${staffRow.business_id}`);
  }

  redirect("/onboarding");
}
