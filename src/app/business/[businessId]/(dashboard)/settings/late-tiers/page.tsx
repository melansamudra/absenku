import { createClient } from "@/lib/supabase/server";
import LateTiersClient, { type LateTier } from "./late-tiers-client";

export default async function LateTiersPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: tiers } = await supabase
    .from("late_deduction_tiers")
    .select("id, threshold_minutes, amount")
    .eq("business_id", businessId)
    .order("threshold_minutes", { ascending: true });

  return <LateTiersClient businessId={businessId} tiers={(tiers ?? []) as LateTier[]} />;
}
