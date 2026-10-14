import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageHeader, Card } from "@/components/form-ui";
import CutiBersamaClient, { type CollectiveLeaveDay } from "./cuti-bersama-client";

export default async function CutiBersamaPage({ params }: { params: Promise<{ businessId: string }> }) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: days }, { data: leaveTypes }] = await Promise.all([
    supabase
      .from("collective_leave_days")
      .select("id, date, label, leave_type_id, leave_types(name)")
      .eq("business_id", businessId)
      .order("date", { ascending: false }),
    supabase
      .from("leave_types")
      .select("id, name")
      .eq("business_id", businessId)
      .eq("active", true)
      .order("created_at", { ascending: true }),
  ]);

  const rows: CollectiveLeaveDay[] = (days ?? []).map((d) => ({
    id: d.id,
    date: d.date,
    label: d.label,
    leaveTypeId: d.leave_type_id,
    leaveTypeName: d.leave_types?.name ?? null,
  }));

  return (
    <div>
      <Link
        href={`/business/${businessId}/leave-requests`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Izin &amp; Cuti
      </Link>
      <PageHeader
        title="Cuti Bersama"
        subtitle="Tanggal libur yang otomatis memotong kuota cuti semua karyawan aktif, tanpa perlu pengajuan satu-satu. Pilih &ldquo;Tidak memotong kuota&rdquo; untuk sekadar mencatat tanggal libur."
      />
      <Card>
        <CutiBersamaClient businessId={businessId} days={rows} leaveTypes={leaveTypes ?? []} />
      </Card>
    </div>
  );
}
