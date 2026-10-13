import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessRole, canAccessEmployeeMaster } from "@/lib/business/role";
import RestrictedAccess from "@/components/restricted-access";

export default async function EmployeesLayout({
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
  if (!canAccessEmployeeMaster(role)) {
    return (
      <RestrictedAccess
        businessId={businessId}
        reason="Peran kamu tidak bisa membuka data Karyawan (termasuk gaji pokok dan rekening bank). Hubungi pemilik bisnis kalau kamu butuh akses ini."
      />
    );
  }

  return <>{children}</>;
}
