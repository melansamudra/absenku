import { createClient } from "@/lib/supabase/server";
import CheckinClient from "./checkin-client";

export default async function AbsenPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: rows } = await supabase.rpc("get_attendance_checkin_info", { p_slug: slug });

  if (!rows || rows.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <h1 className="text-lg font-bold text-zinc-900">Link Tidak Valid</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Link absen ini tidak ditemukan atau belum ada karyawan aktif. Hubungi admin bisnis
            kamu.
          </p>
        </div>
      </div>
    );
  }

  const businessName = rows[0].business_name;
  const employees = rows.map((r) => ({
    id: r.employee_id,
    name: r.employee_name,
    note: r.employee_note,
    hasPin: r.employee_has_pin,
  }));

  return (
    <CheckinClient
      slug={slug}
      businessName={businessName}
      employees={employees}
      geofenceEnabled={rows[0].geofence_enabled}
      pinRequired={rows[0].pin_required}
    />
  );
}
