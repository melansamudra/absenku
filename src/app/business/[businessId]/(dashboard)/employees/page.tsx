import { createClient } from "@/lib/supabase/server";
import EmployeesClient, { type EmployeeRow } from "./employees-client";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ businessId: string }>;
}) {
  const { businessId } = await params;
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select(
      "id, name, salary_type, daily_rate, monthly_rate, active, note, email, contract_end, daily_meal_allowance, daily_attendance_allowance, lembur_rate_per_hour, ptkp_status, bpjs_kesehatan, bpjs_ketenagakerjaan, bpjs_wage_base, nik, join_date, bank_name, bank_account_number, bank_account_name, photo_path, attendance_pin_hash",
    )
    .eq("business_id", businessId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  // Foto di bucket privat: dibuatkan signed URL (1 jam) lewat sesi admin yang login.
  const photoPaths = (employees ?? []).map((e) => e.photo_path).filter((p): p is string => !!p);
  const signed = new Map<string, string>();
  if (photoPaths.length > 0) {
    const { data } = await supabase.storage.from("employee-photos").createSignedUrls(photoPaths, 60 * 60);
    for (const item of data ?? []) if (item.path && item.signedUrl) signed.set(item.path, item.signedUrl);
  }

  // Hash PIN tidak pernah dikirim ke browser — cukup flag ada/tidaknya.
  const rows: EmployeeRow[] = (employees ?? []).map(({ attendance_pin_hash, photo_path, ...e }) => ({
    ...(e as Omit<EmployeeRow, "has_pin" | "photo_url">),
    has_pin: attendance_pin_hash !== null,
    photo_url: photo_path ? (signed.get(photo_path) ?? null) : null,
  }));

  return <EmployeesClient businessId={businessId} employees={rows} />;
}
