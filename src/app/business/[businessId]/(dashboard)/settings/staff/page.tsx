import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessRole } from "@/lib/business/role";
import { PageHeader } from "@/components/form-ui";
import RestrictedAccess from "@/components/restricted-access";
import InviteStaffForm from "./invite-staff-form";
import StaffRow from "./staff-row";

const ROLE_LABEL: Record<string, string> = {
  admin: "Admin (akses penuh)",
  hr: "HR (tanpa Payroll/Laporan/Pengaturan)",
  staff: "Staff (tanpa Payroll/Laporan/Pengaturan/Karyawan)",
};

export default async function StaffSettingsPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const role = await getBusinessRole(supabase, businessId, user.id);
  if (role !== "owner") {
    return (
      <RestrictedAccess
        businessId={businessId}
        reason="Hanya pemilik bisnis yang bisa mengelola akses tim (undang/ubah peran/nonaktifkan staff)."
      />
    );
  }

  const { data: staff } = await supabase
    .from("business_staff")
    .select("id, name, email, role, active, created_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  return (
    <div>
      <PageHeader
        title="Akses Tim"
        subtitle="Undang rekan kerja untuk bantu kelola bisnis ini, dengan peran yang membatasi akses ke data finansial."
      />

      <div className="mb-6 rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-900">Undang Staff Baru</h2>
        <p className="mb-3 text-xs text-zinc-500">
          Orang yang diundang harus sudah punya akun HrCash (daftar lewat halaman Daftar) dengan email yang sama.
        </p>
        <InviteStaffForm businessId={businessId} />
      </div>

      <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
        <div className="border-b border-zinc-100 p-5">
          <h2 className="text-sm font-semibold text-zinc-900">Anggota Tim ({staff?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {(!staff || staff.length === 0) && (
            <p className="p-5 text-sm text-zinc-400">Belum ada staff. Undang lewat form di atas.</p>
          )}
          {staff?.map((s) => (
            <StaffRow key={s.id} businessId={businessId} staff={s} roleLabel={ROLE_LABEL[s.role] ?? s.role} />
          ))}
        </div>
      </div>
    </div>
  );
}
