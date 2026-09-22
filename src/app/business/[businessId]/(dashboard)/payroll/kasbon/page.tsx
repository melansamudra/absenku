import { createClient } from "@/lib/supabase/server";
import { getOutstandingKasbon } from "@/lib/payroll/kasbon";
import LedgerManager, { type LedgerEmployee } from "@/components/ledger-manager";
import { addKasbon } from "./actions";

export default async function KasbonPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const rows: LedgerEmployee[] = await Promise.all(
    (employees ?? []).map(async (e) => ({
      id: e.id,
      name: e.name,
      outstanding: await getOutstandingKasbon(supabase, businessId, e.id),
    })),
  );

  return (
    <LedgerManager
      businessId={businessId}
      employees={rows}
      addAction={addKasbon}
      title="Kasbon"
      description="Catat pemberian kasbon. Potongannya diatur per slip gaji di halaman detail slip."
      addButtonLabel="+ Kasbon"
      submitLabel="Catat Kasbon"
      outstandingLabel="Sisa kasbon"
    />
  );
}
