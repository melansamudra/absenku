import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PendingCounts = {
  /** Pengajuan cuti yang menunggu persetujuan. */
  cuti: number;
  /** Pengajuan lembur yang menunggu persetujuan. */
  lembur: number;
  /** Klaim reimbursement yang menunggu persetujuan. */
  reimbursements: number;
};

// Jumlah permintaan karyawan yang belum diproses admin — dipakai badge di
// menu samping dan kartu "Menunggu persetujuan" di Ringkasan. Hanya hitung
// (head: true), tidak mengambil baris.
export async function loadPendingCounts(
  supabase: SupabaseServerClient,
  businessId: string,
): Promise<PendingCounts> {
  const count = (table: "leave_requests" | "overtime_requests" | "reimbursements") =>
    supabase
      .from(table)
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .eq("status", "pending");

  const [cuti, lembur, reimbursements] = await Promise.all([
    count("leave_requests"),
    count("overtime_requests"),
    count("reimbursements"),
  ]);

  return {
    cuti: cuti.count ?? 0,
    lembur: lembur.count ?? 0,
    reimbursements: reimbursements.count ?? 0,
  };
}
