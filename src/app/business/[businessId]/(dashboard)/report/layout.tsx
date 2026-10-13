import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessRole, canAccessFinance } from "@/lib/business/role";
import RestrictedAccess from "@/components/restricted-access";

export default async function ReportLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getBusinessRole(supabase, businessId, user.id);
  if (!canAccessFinance(role)) {
    return (
      <RestrictedAccess
        businessId={businessId}
        reason="Hanya pemilik bisnis dan admin yang bisa membuka Laporan. Hubungi pemilik bisnis kalau kamu butuh akses ini."
      />
    );
  }

  return <>{children}</>;
}
