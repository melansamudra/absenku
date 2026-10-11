import { Card, PageHeader } from "@/components/form-ui";
import { saveStep1 } from "../wizard-actions";
import { Step1Form, Stepper } from "../wizard-forms";

export default async function AddEmployeePage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const base = `/business/${businessId}/employees`;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader title="Tambah Karyawan" subtitle="Isi data bertahap — tiap langkah tersimpan otomatis." />
      <Card className="mb-4">
        <Stepper current={1} basePath={base} employeeId={null} />
      </Card>
      <Card>
        <Step1Form
          action={saveStep1.bind(null, businessId, null)}
          employee={null}
          backHref={base}
        />
      </Card>
    </div>
  );
}
