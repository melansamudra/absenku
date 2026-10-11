import { PageHeader } from "@/components/form-ui";
import KpiFormEditor from "../form-editor";

export default async function NewKpiFormPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tambah Formulir KPI" subtitle="Tentukan indikator penilaian dan bobotnya (total 100%)." />
      <KpiFormEditor
        businessId={businessId}
        initial={{ id: null, name: "", description: "", status: "draft", indicators: [], locked: false }}
      />
    </div>
  );
}
