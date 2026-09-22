import { createClient } from "@/lib/supabase/server";
import { getOutstandingPersonalLoan } from "@/lib/payroll/personal-loan";
import LedgerManager, { type LedgerEmployee } from "@/components/ledger-manager";
import { addPersonalLoan } from "./actions";

export default async function PinjamanPage({
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
      outstanding: await getOutstandingPersonalLoan(supabase, businessId, e.id),
    })),
  );

  return (
    <LedgerManager
      businessId={businessId}
      employees={rows}
      addAction={addPersonalLoan}
      title="Pinjaman Pribadi"
      description="Catat pemberian pinjaman pribadi (terpisah dari kasbon). Potongannya diatur per slip gaji di halaman detail slip."
      addButtonLabel="+ Pinjaman"
      submitLabel="Catat Pinjaman"
      outstandingLabel="Sisa pinjaman"
    />
  );
}
