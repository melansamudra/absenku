import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import MasterManager, { type MasterItem } from "./master-manager";

export default async function MasterDataPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [orgs, positions, ranks, employees] = await Promise.all([
    supabase.from("organizations").select("id, name").eq("business_id", businessId).order("name"),
    supabase.from("positions").select("id, name").eq("business_id", businessId).order("name"),
    supabase.from("ranks").select("id, name").eq("business_id", businessId).order("name"),
    supabase
      .from("employees")
      .select("organization_id, position_id, rank_id")
      .eq("business_id", businessId)
      .is("deleted_at", null),
  ]);

  const count = (key: "organization_id" | "position_id" | "rank_id") => {
    const m = new Map<string, number>();
    for (const e of employees.data ?? []) {
      const id = e[key];
      if (id) m.set(id, (m.get(id) ?? 0) + 1);
    }
    return m;
  };
  const withUsage = (rows: { id: string; name: string }[] | null, key: "organization_id" | "position_id" | "rank_id"): MasterItem[] => {
    const usage = count(key);
    return (rows ?? []).map((r) => ({ ...r, used: usage.get(r.id) ?? 0 }));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        href={`/business/${businessId}/settings`}
        className="mb-3 inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700"
      >
        <ChevronLeft size={14} /> Pengaturan
      </Link>
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Organisasi, Jabatan &amp; Pangkat</h1>
        <p className="mt-0.5 text-sm text-zinc-500">Data master yang dipilih di profil karyawan (langkah Kepegawaian).</p>
      </div>
      <MasterManager
        businessId={businessId}
        data={{
          organizations: withUsage(orgs.data, "organization_id"),
          positions: withUsage(positions.data, "position_id"),
          ranks: withUsage(ranks.data, "rank_id"),
        }}
      />
    </div>
  );
}
