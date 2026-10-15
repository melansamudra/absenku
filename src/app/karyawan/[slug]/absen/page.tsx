import { notFound, redirect } from "next/navigation";
import { loadPortalContext } from "@/lib/portal/session";
import { createServiceClient } from "@/lib/supabase/service";
import { loadCheckinConfig } from "@/lib/attendance/checkin-config";
import CheckinClient from "@/app/absen/[slug]/checkin-client";

// Check In dari Portal Karyawan: nama diambil dari sesi login portal (tidak perlu pilih nama lagi).
// PIN absen tetap diminta di halaman ini, sama seperti di link absen publik.
export default async function PortalCheckinPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { business, employee } = await loadPortalContext(slug);
  if (!business) notFound();
  if (!employee) redirect(`/karyawan/${slug}`);

  const supabase = createServiceClient();
  const [config, { data: biz }] = await Promise.all([
    loadCheckinConfig(supabase, business.id),
    supabase.from("businesses").select("attendance_pin_required").eq("id", business.id).maybeSingle(),
  ]);

  return (
    <CheckinClient
      slug={slug}
      businessName={business.name}
      employees={[{ id: employee.id, name: employee.name, note: employee.note, hasPin: true }]}
      spots={config.spots}
      pinRequired={!!biz?.attendance_pin_required}
      lateReasonEnabled={config.lateReasonEnabled}
      lockedEmployeeId={employee.id}
      backHref={`/karyawan/${slug}`}
    />
  );
}
