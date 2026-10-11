import { redirect } from "next/navigation";

export default async function KpiIndexPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  redirect(`/business/${businessId}/kpi/forms`);
}
