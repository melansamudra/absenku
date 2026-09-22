import { createClient } from "@/lib/supabase/server";
import HolidaysClient, { type Holiday } from "./holidays-client";

export default async function HolidaysPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: holidays } = await supabase
    .from("payroll_holidays")
    .select("id, holiday_date, label")
    .eq("business_id", businessId)
    .order("holiday_date", { ascending: true });

  return <HolidaysClient businessId={businessId} holidays={(holidays ?? []) as Holiday[]} />;
}
