"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

export async function addOfficeLocation(
  businessId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const name = ((formData.get("name") as string) || "").trim();
  const lat = Number(formData.get("lat"));
  const lng = Number(formData.get("lng"));
  const radius = Number(formData.get("radius_m"));

  if (!name) return { error: "Nama lokasi wajib diisi." };
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) return { error: "Latitude harus -90 sampai 90." };
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) return { error: "Longitude harus -180 sampai 180." };
  if (!Number.isInteger(radius) || radius < 10 || radius > 10000) {
    return { error: "Radius harus bilangan bulat 10–10000 meter." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("office_locations")
    .insert({ business_id: businessId, name, lat, lng, radius_m: radius });
  if (error) return { error: error.message };

  await logActivity(supabase, businessId, "Lokasi kantor ditambah", name);
  revalidatePath(`/business/${businessId}/settings/locations`);
  return { error: null };
}

export async function deleteOfficeLocation(businessId: string, locationId: string) {
  const supabase = await createClient();
  const { data: loc } = await supabase
    .from("office_locations")
    .select("name")
    .eq("id", locationId)
    .eq("business_id", businessId)
    .maybeSingle();
  await supabase.from("office_locations").delete().eq("id", locationId).eq("business_id", businessId);
  if (loc) await logActivity(supabase, businessId, "Lokasi kantor dihapus", loc.name);
  revalidatePath(`/business/${businessId}/settings/locations`);
}
