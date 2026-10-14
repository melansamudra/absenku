import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, PageHeader } from "@/components/form-ui";
import AdhocPayslipForm from "./adhoc-form";

export default async function AdhocPayslipPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select("id, name")
    .eq("business_id", businessId)
    .eq("active", true)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  return (
    <div>
      <Link
        href={`/business/${businessId}/payroll`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Payroll
      </Link>
      <PageHeader
        title="Slip Tidak Tetap"
        subtitle="Untuk pembayaran di luar siklus bulanan (bonus proyek, pesangon, dll.) yang tidak dihitung dari absensi. Setelah dibuat, tambahkan komponennya lewat tunjangan/potongan di halaman detail slip."
      />
      <Card>
        <AdhocPayslipForm businessId={businessId} employees={employees ?? []} />
      </Card>
    </div>
  );
}
