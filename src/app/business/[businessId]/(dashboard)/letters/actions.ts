"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { LETTER_KINDS, defaultLetterNumber, isLetterKind } from "@/lib/letters/templates";

export type LetterActionState = { error: string | null };

export async function createLetter(
  businessId: string,
  _prevState: LetterActionState,
  formData: FormData,
): Promise<LetterActionState> {
  const employeeId = (formData.get("employee_id") as string) || "";
  const kind = (formData.get("kind") as string) || "";
  const issuedDate = (formData.get("issued_date") as string) || "";
  const subject = ((formData.get("subject") as string) || "").trim().slice(0, 200);
  const body = ((formData.get("body") as string) || "").trim().slice(0, 5000);
  let letterNumber = ((formData.get("letter_number") as string) || "").trim().slice(0, 60) || null;

  if (!employeeId) return { error: "Pilih karyawan dulu." };
  if (!isLetterKind(kind)) return { error: "Jenis surat tidak valid." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(issuedDate)) return { error: "Tanggal surat tidak valid." };
  if (!subject) return { error: "Perihal wajib diisi." };
  if (!body) return { error: "Isi surat wajib diisi." };

  const supabase = await createClient();
  const { data: employee } = await supabase
    .from("employees")
    .select("name")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .maybeSingle();
  if (!employee) return { error: "Karyawan tidak ditemukan." };

  if (!letterNumber) {
    const { count } = await supabase
      .from("employee_letters")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId)
      .gte("issued_date", `${issuedDate.slice(0, 4)}-01-01`)
      .lte("issued_date", `${issuedDate.slice(0, 4)}-12-31`);
    letterNumber = defaultLetterNumber(kind, (count ?? 0) + 1, issuedDate);
  }

  const { data: letter, error } = await supabase
    .from("employee_letters")
    .insert({
      business_id: businessId,
      employee_id: employeeId,
      kind,
      letter_number: letterNumber,
      issued_date: issuedDate,
      subject,
      body,
    })
    .select("id")
    .single();
  if (error || !letter) return { error: error?.message ?? "Gagal menyimpan surat." };

  await logActivity(supabase, businessId, "Surat dibuat", `${LETTER_KINDS[kind]} · ${employee.name}`);
  revalidatePath(`/business/${businessId}/letters`);
  redirect(`/business/${businessId}/letters/${letter.id}`);
}

export async function deleteLetter(businessId: string, letterId: string) {
  const supabase = await createClient();
  await supabase.from("employee_letters").delete().eq("id", letterId).eq("business_id", businessId);
  await logActivity(supabase, businessId, "Surat dihapus");
  revalidatePath(`/business/${businessId}/letters`);
}
