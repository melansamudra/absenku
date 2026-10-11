import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/form-ui";
import KpiFormEditor from "../form-editor";

export default async function EditKpiFormPage({
  params,
}: {
  params: Promise<{ businessId: string; formId: string }>;
}) {
  const { businessId, formId } = await params;
  const supabase = await createClient();

  const [{ data: form }, { data: indicators }, { count }] = await Promise.all([
    supabase.from("kpi_forms").select("id, name, description, status").eq("id", formId).eq("business_id", businessId).maybeSingle(),
    supabase
      .from("kpi_indicators")
      .select("id, name, description, weight")
      .eq("form_id", formId)
      .eq("business_id", businessId)
      .order("sort_order"),
    supabase.from("kpi_schedules").select("id", { count: "exact", head: true }).eq("form_id", formId).eq("business_id", businessId),
  ]);
  if (!form) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Ubah Formulir KPI" subtitle={form.name} />
      <KpiFormEditor
        businessId={businessId}
        initial={{
          id: form.id,
          name: form.name,
          description: form.description ?? "",
          status: form.status === "active" ? "active" : "draft",
          indicators: (indicators ?? []).map((i) => ({ id: i.id, name: i.name, description: i.description ?? "", weight: Number(i.weight) })),
          locked: (count ?? 0) > 0,
        }}
      />
    </div>
  );
}
