import { createClient } from "@/lib/supabase/server";
import { reimbursementCategoryLabel } from "@/lib/reimbursement/categories";
import ReimbursementRow, { type PendingReimbursement } from "./reimbursement-row";

const rupiah = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;

export default async function ReimbursementsPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const [{ data: pendingRows }, { data: historyRows }] = await Promise.all([
    supabase
      .from("reimbursements")
      .select("id, date, category, amount, description, employees(name)")
      .eq("business_id", businessId)
      .eq("status", "pending")
      .order("date", { ascending: true }),
    supabase
      .from("reimbursements")
      .select("id, date, category, amount, status, reviewed_note, payslip_id, employees(name)")
      .eq("business_id", businessId)
      .neq("status", "pending")
      .order("reviewed_at", { ascending: false })
      .limit(40),
  ]);

  const employeeName = (e: unknown) => (e as { name: string } | null)?.name ?? "—";
  const pending: PendingReimbursement[] = (pendingRows ?? []).map((r) => ({
    id: r.id,
    employeeName: employeeName(r.employees),
    date: r.date,
    categoryLabel: reimbursementCategoryLabel(r.category),
    amount: Number(r.amount),
    description: r.description,
  }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Reimbursement</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Klaim biaya dari Portal Karyawan. Klaim yang disetujui otomatis masuk sebagai tunjangan
          di slip gaji berikutnya karyawan itu (tidak kena PPh21/BPJS).
        </p>
      </div>

      <h2 className="mb-2 text-sm font-semibold text-zinc-800">Menunggu persetujuan ({pending.length})</h2>
      {pending.length === 0 ? (
        <div className="mb-6 rounded-xl border border-dashed border-zinc-300 bg-white py-10 text-center">
          <p className="text-sm text-zinc-500">Tidak ada klaim yang menunggu.</p>
        </div>
      ) : (
        <div className="mb-6 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {pending.map((r) => (
              <ReimbursementRow key={r.id} businessId={businessId} claim={r} />
            ))}
          </div>
        </div>
      )}

      {(historyRows ?? []).length > 0 && (
        <>
          <h2 className="mb-2 text-sm font-semibold text-zinc-800">Riwayat</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
            <div className="divide-y divide-zinc-100">
              {(historyRows ?? []).map((r) => {
                const label =
                  r.status === "rejected"
                    ? { text: "Ditolak", className: "bg-red-50 text-red-600" }
                    : r.payslip_id
                      ? { text: "Sudah masuk slip", className: "bg-emerald-50 text-emerald-700" }
                      : { text: "Disetujui · belum masuk slip", className: "bg-amber-50 text-amber-700" };
                return (
                  <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="text-zinc-800">
                        {employeeName(r.employees)} · {r.date} · {reimbursementCategoryLabel(r.category)} ·{" "}
                        {rupiah(Number(r.amount))}
                      </p>
                      {r.reviewed_note && <p className="text-xs text-zinc-400">{r.reviewed_note}</p>}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${label.className}`}>
                      {label.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
