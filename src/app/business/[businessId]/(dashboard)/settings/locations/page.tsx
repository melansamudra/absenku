import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LocationsClient, { type OfficeLocation } from "./locations-client";

export default async function LocationsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: business }, { data: locations }] = await Promise.all([
    supabase
      .from("businesses")
      .select("office_lat, office_lng, attendance_radius_m")
      .eq("id", businessId)
      .single(),
    supabase
      .from("office_locations")
      .select("id, name, lat, lng, radius_m")
      .eq("business_id", businessId)
      .order("created_at", { ascending: true }),
  ]);

  const primary =
    business?.office_lat != null && business?.office_lng != null && business?.attendance_radius_m != null
      ? {
          lat: Number(business.office_lat),
          lng: Number(business.office_lng),
          radius_m: business.attendance_radius_m,
        }
      : null;

  return (
    <div>
      <Link href={`/business/${businessId}/settings`} className="text-xs text-zinc-400 hover:text-zinc-600">
        ← Pengaturan
      </Link>
      <LocationsClient
        businessId={businessId}
        primary={primary}
        locations={(locations ?? []).map((l) => ({
          id: l.id,
          name: l.name,
          lat: Number(l.lat),
          lng: Number(l.lng),
          radius_m: l.radius_m,
        })) as OfficeLocation[]}
      />
    </div>
  );
}
