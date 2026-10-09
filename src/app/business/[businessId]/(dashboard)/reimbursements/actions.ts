"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { reimbursementCategoryLabel } from "@/lib/reimbursement/categories";

export type ReimbursementActionState = { error: string | null };

// Disetujui → masuk ke slip gaji berikutnya karyawan itu (lihat createPayslip
// di payroll/rekap/actions.ts) sebagai tunjangan, tidak kena PPh21/BPJS.
export async function approveReimbursement(
  businessId: string,
  id: string,
  _prevState: ReimbursementActionState,
  formData: FormData,
): Promise<ReimbursementActionState> {
  const amount = Number(formData.get("amount") ?? 0);
  if (!(amount > 0)) return { error: "Nominal harus lebih dari 0." };

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("reimbursements")
    .select("status, category, employees(name)")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();
  if (!row) return { error: "Klaim tidak ditemukan." };
  if (row.status !== "pending") return { error: "Klaim ini sudah diproses." };

  await supabase
    .from("reimbursements")
    .update({ status: "approved", amount, reviewed_at: new Date().toISOString() })
    .eq("id", id)
    .eq("business_id", businessId)
    .eq("status", "pending");

  const name = (row.employees as unknown as { name: string } | null)?.name ?? "—";
  await logActivity(
    supabase,
    businessId,
    "Reimbursement disetujui",
    `${name} · ${reimbursementCategoryLabel(row.category)} · Rp${amount.toLocaleString("id-ID")}`,
  );
  revalidatePath(`/business/${businessId}/reimbursements`);
  return { error: null };
}

export async function rejectReimbursement(
  businessId: string,
  id: string,
  _prevState: ReimbursementActionState,
  formData: FormData,
): Promise<ReimbursementActionState> {
  const note = ((formData.get("note") as string) || "").trim().slice(0, 300) || null;
  const supabase = await createClient();

  const { data: row } = await supabase
    .from("reimbursements")
    .select("status, employees(name)")
    .eq("id", id)
    .eq("business_id", businessId)
    .single();
  if (!row) return { error: "Klaim tidak ditemukan." };
  if (row.status !== "pending") return { error: "Klaim ini sudah diproses." };

  await supabase
    .from("reimbursements")
    .update({ status: "rejected", reviewed_at: new Date().toISOString(), reviewed_note: note })
    .eq("id", id)
    .eq("business_id", businessId)
    .eq("status", "pending");

  const name = (row.employees as unknown as { name: string } | null)?.name ?? "—";
  await logActivity(supabase, businessId, "Reimbursement ditolak", name);
  revalidatePath(`/business/${businessId}/reimbursements`);
  return { error: null };
}
