import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { loadPendingCounts } from "@/lib/dashboard/pending";
import DashboardShell from "./dashboard-shell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("name")
    .eq("id", businessId)
    .single();

  return { title: business?.name ?? "HR Cashimpact" };
}

export default async function BusinessDashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: business }, { data: userData }] = await Promise.all([
    supabase.from("businesses").select("id, name, owner_id").eq("id", businessId).single(),
    supabase.auth.getUser(),
  ]);

  if (!business) {
    notFound();
  }

  if (!userData.user) redirect("/login");

  const isOwner = business.owner_id === userData.user.id;

  if (!isOwner) {
    const { data: staff } = await supabase
      .from("business_staff")
      .select("active")
      .eq("business_id", businessId)
      .eq("user_id", userData.user.id)
      .maybeSingle();

    if (!staff || !staff.active) {
      notFound();
    }
  }

  const pending = await loadPendingCounts(supabase, businessId);

  // Semua bisnis yang boleh dibuka user ini (milik sendiri + staf aktif) —
  // RLS sudah menyaringnya. Dipakai untuk pemilih bisnis di header.
  const { data: businessList } = await supabase
    .from("businesses")
    .select("id, name")
    .order("created_at", { ascending: true });

  return (
    <DashboardShell
      businessId={businessId}
      businessName={business.name}
      businesses={businessList ?? [{ id: business.id, name: business.name }]}
      userEmail={userData.user.email ?? ""}
      badges={{
        "attendance/approval": pending.presensi,
        "leave-requests": pending.cuti,
        overtime: pending.lembur,
        reimbursements: pending.reimbursements,
      }}
    >
      {children}
    </DashboardShell>
  );
}
