import type { SupabaseClient } from "@supabase/supabase-js";
import type { GeofenceSpot } from "@/lib/attendance/geofence";

// Konfigurasi halaman Check In: semua lokasi kerja (titik utama + lokasi tambahan) untuk peta/jarak,
// dan apakah kolom alasan terlambat sudah ada di database (migration 20261018100000).
export type CheckinConfig = { spots: (GeofenceSpot & { name: string })[]; lateReasonEnabled: boolean };

export async function loadCheckinConfig(supabase: SupabaseClient, businessId: string): Promise<CheckinConfig> {
  const [{ data: biz }, { data: extra }, probe] = await Promise.all([
    supabase.from("businesses").select("office_lat, office_lng, attendance_radius_m").eq("id", businessId).maybeSingle(),
    supabase.from("office_locations").select("name, lat, lng, radius_m").eq("business_id", businessId).order("created_at"),
    supabase.from("attendance").select("late_reason").limit(1),
  ]);
  const spots: CheckinConfig["spots"] = [];
  if (biz && biz.office_lat !== null && biz.office_lng !== null && biz.attendance_radius_m !== null) {
    spots.push({ name: "Lokasi kerja utama", lat: Number(biz.office_lat), lng: Number(biz.office_lng), radiusM: biz.attendance_radius_m });
  }
  for (const l of extra ?? []) spots.push({ name: l.name, lat: Number(l.lat), lng: Number(l.lng), radiusM: l.radius_m });
  return { spots, lateReasonEnabled: !probe.error };
}
