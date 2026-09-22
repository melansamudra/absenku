"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getOutstandingKasbon } from "@/lib/payroll/kasbon";
import { getOutstandingPersonalLoan } from "@/lib/payroll/personal-loan";
import { payslipTotal } from "@/lib/payroll/payslip-total";
import { logActivity } from "@/lib/activity-log";

export type ActionState = { error: string | null };

async function assertUnpaid(
  supabase: Awaited<ReturnType<typeof createClient>>,
  businessId: string,
  payslipId: string,
) {
  const { data } = await supabase
    .from("payslips")
    .select("paid_at")
    .eq("id", payslipId)
    .eq("business_id", businessId)
    .single();
  if (!data) return "Slip tidak ditemukan.";
  if (data.paid_at) return "Slip sudah lunas — tidak bisa diedit.";
  return null;
}

export async function addAdjustment(
  businessId: string,
  payslipId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return { error: unpaidError };

  const type = formData.get("type") as string;
  const label = ((formData.get("label") as string) || "").trim();
  const amount = Number(formData.get("amount") ?? 0);

  if (type !== "tunjangan" && type !== "potongan") return { error: "Jenis tidak valid." };
  if (!label) return { error: "Keterangan wajib diisi." };
  if (!(amount >= 0)) return { error: "Nominal tidak valid." };

  const { error } = await supabase
    .from("payslip_adjustments")
    .insert({ payslip_id: payslipId, type, label, amount });

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  return { error: null };
}

export async function deleteAdjustment(businessId: string, payslipId: string, adjustmentId: string) {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return;

  await supabase.from("payslip_adjustments").delete().eq("id", adjustmentId);
  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
}

export async function updateLemburThr(
  businessId: string,
  payslipId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return { error: unpaidError };

  const lemburAmount = Number(formData.get("lembur_amount") ?? 0);
  const thrAmount = Number(formData.get("thr_amount") ?? 0);

  if (!(lemburAmount >= 0) || !(thrAmount >= 0)) {
    return { error: "Nominal tidak valid." };
  }

  const { error } = await supabase
    .from("payslips")
    .update({ lembur_amount: lemburAmount, thr_amount: thrAmount })
    .eq("id", payslipId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  return { error: null };
}

export async function updatePph21Amount(
  businessId: string,
  payslipId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return { error: unpaidError };

  const pph21Amount = Number(formData.get("pph21_amount") ?? 0);
  if (!(pph21Amount >= 0)) return { error: "Nominal tidak valid." };

  const { error } = await supabase
    .from("payslips")
    .update({ pph21_amount: pph21Amount })
    .eq("id", payslipId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  return { error: null };
}

export async function updateKasbonDeduction(
  businessId: string,
  payslipId: string,
  employeeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return { error: unpaidError };

  const amount = Number(formData.get("kasbon_deduction") ?? 0);
  if (!(amount >= 0)) return { error: "Nominal tidak valid." };

  const outstanding = await getOutstandingKasbon(supabase, businessId, employeeId);
  // Slip ini sendiri belum berkontribusi ke `outstanding` di atas (kasbon_deduction-nya
  // baru dibaca dari payslip yang SUDAH paid_at), jadi batas amannya murni outstanding saat ini.
  if (amount > outstanding) {
    return { error: `Melebihi sisa kasbon (Rp ${outstanding.toLocaleString("id-ID")}).` };
  }

  const { error } = await supabase
    .from("payslips")
    .update({ kasbon_deduction: amount })
    .eq("id", payslipId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  return { error: null };
}

export async function updatePersonalLoanDeduction(
  businessId: string,
  payslipId: string,
  employeeId: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const supabase = await createClient();
  const unpaidError = await assertUnpaid(supabase, businessId, payslipId);
  if (unpaidError) return { error: unpaidError };

  const amount = Number(formData.get("personal_loan_deduction") ?? 0);
  if (!(amount >= 0)) return { error: "Nominal tidak valid." };

  const outstanding = await getOutstandingPersonalLoan(supabase, businessId, employeeId);
  if (amount > outstanding) {
    return { error: `Melebihi sisa pinjaman (Rp ${outstanding.toLocaleString("id-ID")}).` };
  }

  const { error } = await supabase
    .from("payslips")
    .update({ personal_loan_deduction: amount })
    .eq("id", payslipId)
    .eq("business_id", businessId);

  if (error) return { error: error.message };

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  return { error: null };
}

export async function markPayslipPaid(businessId: string, payslipId: string) {
  const supabase = await createClient();

  const [{ data: payslip }, { data: adjustments }] = await Promise.all([
    supabase
      .from("payslips")
      .select("*, employees(name)")
      .eq("id", payslipId)
      .eq("business_id", businessId)
      .single(),
    supabase.from("payslip_adjustments").select("type, amount").eq("payslip_id", payslipId),
  ]);

  if (!payslip) return { error: "Slip tidak ditemukan." };
  if (payslip.paid_at) return { error: "Slip sudah lunas." };

  const typedAdjustments = (adjustments ?? []) as { type: "tunjangan" | "potongan"; amount: number }[];
  const total = payslipTotal(payslip, typedAdjustments);
  if (!(total > 0)) return { error: "Total slip harus lebih dari 0 sebelum ditandai lunas." };

  // .is("paid_at", null) di WHERE sebagai optimistic lock terhadap submit ganda.
  const { error } = await supabase
    .from("payslips")
    .update({ paid_at: new Date().toISOString() })
    .eq("id", payslipId)
    .eq("business_id", businessId)
    .is("paid_at", null);

  if (error) return { error: error.message };

  const employeeName = (payslip.employees as unknown as { name: string } | null)?.name ?? "—";
  await logActivity(
    supabase,
    businessId,
    "Slip gaji ditandai lunas",
    `${employeeName} · ${payslip.period_start} — ${payslip.period_end} · Rp ${Math.round(total).toLocaleString("id-ID")}`,
  );

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  revalidatePath(`/business/${businessId}/payroll`);
  return { error: null };
}

export async function unmarkPayslipPaid(businessId: string, payslipId: string) {
  const supabase = await createClient();

  const { data: payslip } = await supabase
    .from("payslips")
    .select("period_start, period_end, employees(name)")
    .eq("id", payslipId)
    .eq("business_id", businessId)
    .single();

  await supabase
    .from("payslips")
    .update({ paid_at: null })
    .eq("id", payslipId)
    .eq("business_id", businessId);

  if (payslip) {
    const employeeName = (payslip.employees as unknown as { name: string } | null)?.name ?? "—";
    await logActivity(
      supabase,
      businessId,
      "Status lunas slip gaji dibatalkan",
      `${employeeName} · ${payslip.period_start} — ${payslip.period_end}`,
    );
  }

  revalidatePath(`/business/${businessId}/payroll/${payslipId}`);
  revalidatePath(`/business/${businessId}/payroll`);
}
