import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/form-ui";
import ScheduleForm from "../schedule-form";

export default async function NewKpiSchedulePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: forms }, { data: employees }] = await Promise.all([
    supabase.from("kpi_forms").select("id, name").eq("business_id", businessId).eq("status", "active").order("name"),
    supabase
      .from("employees")
      .select("id, name, employee_code, positions(name)")
      .eq("business_id", businessId)
      .eq("active", true)
      .is("deleted_at", null)
      .order("created_at", { ascending: true }),
  ]);

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tambah Jadwal KPI" subtitle="Pilih formulir, periode, dan karyawan yang akan dinilai." />
      <ScheduleForm
        businessId={businessId}
        forms={forms ?? []}
        employees={(employees ?? []).map((e) => ({
          id: e.id,
          name: e.name,
          sub: [e.employee_code, e.positions?.name].filter(Boolean).join(" · "),
        }))}
      />
    </div>
  );
}
