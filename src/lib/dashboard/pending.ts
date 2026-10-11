import type { createClient } from "@/lib/supabase/server";

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

export type PendingCounts = {
  /** Pengajuan cuti yang menunggu persetujuan. */
  cuti: number;
  /** Pengajuan lembur yang menunggu persetujuan. */
  lembur: number;
  /** Klaim reimbursement yang menunggu persetujuan. */
  reimbursements: number;
  /** Presensi selfie bulan ini yang belum disetujui/ditolak admin. */
  presensi: number;
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

  // Hanya bulan berjalan: riwayat lama yang tak pernah diverifikasi tidak ikut dihitung.
  const monthStart = `${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" }).slice(0, 7)}-01`;

  const [cuti, lembur, reimbursements, presensi] = await Promise.all([
    count("leave_requests"),
    count("overtime_requests"),
    count("reimbursements"),
    supabase
      .from("attendance")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("date", monthStart)
      .not("check_in_at", "is", null)
      .eq("verified_by_admin", false)
      .is("rejected_at", null),
  ]);

  return {
    cuti: cuti.count ?? 0,
    lembur: lembur.count ?? 0,
    reimbursements: reimbursements.count ?? 0,
    presensi: presensi.count ?? 0,
  };
}
