import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/lib/types/database";
import { Card, PageHeader } from "@/components/form-ui";
import { saveStep1, saveStep2, saveStep3 } from "../../../wizard-actions";
import { Step1Form, Step2Form, Step3Form, Stepper } from "../../../wizard-forms";

export default async function EmployeeSetupPage({
  params,
}: {
  params: Promise<{ businessId: string; employeeId: string; step: string }>;
}) {
  const { businessId, employeeId, step } = await params;
  if (step !== "1" && step !== "2" && step !== "3") notFound();
  const n = Number(step) as 1 | 2 | 3;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .maybeSingle();
  if (!row) notFound();

  // Hash PIN tidak pernah dikirim ke browser — cukup penanda sudah/belum diatur.
  const { attendance_pin_hash, ...rest } = row;
  const employee: Tables<"employees"> = { ...rest, attendance_pin_hash: attendance_pin_hash ? "set" : null };

  const base = `/business/${businessId}/employees`;
  const detailHref = `${base}/${employeeId}`;
  const prev = n === 1 ? (employee.setup_complete ? detailHref : base) : `${base}/${employeeId}/setup/${n - 1}`;
  // Karyawan yang sudah lengkap kembali ke detail; yang masih draft bisa menunda.
  const skip = employee.setup_complete ? undefined : detailHref;

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title={employee.setup_complete ? `Ubah Data — ${employee.name}` : "Tambah Karyawan"}
        subtitle={employee.setup_complete ? undefined : `${employee.name} · belum lengkap`}
      />
      <Card className="mb-4">
        <Stepper current={n} basePath={base} employeeId={employeeId} />
      </Card>
      <Card>
        {n === 1 && (
          <Step1Form
            action={saveStep1.bind(null, businessId, employeeId)}
            employee={employee}
            backHref={prev}
            skipHref={skip}
          />
        )}
        {n === 2 && (
          <Step2Wrapper businessId={businessId} employeeId={employeeId} employee={employee} backHref={prev} skipHref={skip} />
        )}
        {n === 3 && (
          <Step3Wrapper businessId={businessId} employeeId={employeeId} employee={employee} backHref={prev} />
        )}
      </Card>
    </div>
  );
}

type Emp = Tables<"employees">;

async function Step2Wrapper({
  businessId,
  employeeId,
  employee,
  backHref,
  skipHref,
}: {
  businessId: string;
  employeeId: string;
  employee: Emp;
  backHref: string;
  skipHref?: string;
}) {
  const supabase = await createClient();
  const [orgs, positions, ranks] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("business_id", businessId).order("name"),
    supabase.from("positions").select("id, name").eq("business_id", businessId).order("name"),
    supabase.from("ranks").select("id, name").eq("business_id", businessId).order("name"),
  ]);
  return (
    <Step2Form
      action={saveStep2.bind(null, businessId, employeeId)}
      employee={employee}
      businessId={businessId}
      organizations={orgs.data ?? []}
      positions={positions.data ?? []}
      ranks={ranks.data ?? []}
      backHref={backHref}
      skipHref={skipHref}
    />
  );
}

function Step3Wrapper({
  businessId,
  employeeId,
  employee,
  backHref,
}: {
  businessId: string;
  employeeId: string;
  employee: Emp;
  backHref: string;
}) {
  return <Step3Form action={saveStep3.bind(null, businessId, employeeId)} employee={employee} backHref={backHref} />;
}
