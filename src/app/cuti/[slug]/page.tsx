import { createClient } from "@/lib/supabase/server";
import CutiForm from "./cuti-form";

export default async function CutiPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rows } = await supabase.rpc("get_leave_request_info", { p_slug: slug });

  if (!rows || rows.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-zinc-900">Link Tidak Valid</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Link pengajuan cuti ini tidak ditemukan, belum ada karyawan aktif, atau belum ada
            jenis cuti yang diatur. Hubungi admin bisnis kamu.
          </p>
        </div>
      </div>
    );
  }

  const businessName = rows[0].business_name;

  const employeeMap = new Map<string, string>();
  const leaveTypeMap = new Map<string, string>();
  for (const r of rows) {
    employeeMap.set(r.employee_id, r.employee_name);
    leaveTypeMap.set(r.leave_type_id, r.leave_type_name);
  }
  const employees = [...employeeMap.entries()].map(([id, name]) => ({ id, name }));
  const leaveTypes = [...leaveTypeMap.entries()].map(([id, name]) => ({ id, name }));

  return (
    <CutiForm slug={slug} businessName={businessName} employees={employees} leaveTypes={leaveTypes} />
  );
}
