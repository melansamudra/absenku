"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { nextEmployeeCode } from "@/lib/employee/code";
import { recordCareerChange, recordSalaryChange } from "@/lib/employee/history";
import { hashPin, PIN_PATTERN } from "@/lib/attendance/pin";
import { identityDbError, parseIdentity } from "@/lib/employees/identity";
import { CONTRACT_STATUSES, EMPLOYMENT_STATUSES, PTKP_OPTIONS } from "@/lib/employee/constants";

export type WizardState = { error: string | null };

const str = (fd: FormData, k: string) => ((fd.get(k) as string) || "").trim();
const strOrNull = (fd: FormData, k: string) => str(fd, k) || null;
const num = (fd: FormData, k: string) => {
  const n = Number(fd.get(k));
  return Number.isFinite(n) ? n : 0;
};

// dd/mm/yyyy atau yyyy-mm-dd → yyyy-mm-dd (atau null kalau kosong/tidak valid)
function toIsoDate(value: string): string | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null;
}

/** Langkah 1 — Personal. Tanpa employeeId = buat karyawan baru (draft belum lengkap). */
export async function saveStep1(
  businessId: string,
  employeeId: string | null,
  _prev: WizardState,
  fd: FormData,
): Promise<WizardState> {
  const supabase = await createClient();

  const name = str(fd, "name");
  const domicileSame = fd.get("domicile_same") === "on";
  const required: [string, string][] = [
    ["name", "Nama lengkap"],
    ["birth_place", "Tempat lahir"],
    ["birth_date", "Tanggal lahir"],
    ["marital_status", "Status perkawinan"],
    ["religion", "Agama"],
    ["id_number", "ID kartu identitas"],
    ["email", "Email"],
    ["phone", "Nomor ponsel"],
    ["id_address", "Alamat kartu identitas"],
    ["id_province", "Provinsi"],
    ["id_city", "Kota"],
    ["emergency_name", "Nama kontak darurat"],
    ["emergency_phone", "Telepon darurat"],
  ];
  if (!domicileSame) {
    required.push(["dom_address", "Alamat domisili"], ["dom_province", "Provinsi domisili"], ["dom_city", "Kota domisili"]);
  }
  for (const [key, label] of required) {
    if (!str(fd, key)) return { error: `${label} wajib diisi.` };
  }
  const birthDate = toIsoDate(str(fd, "birth_date"));
  if (!birthDate) return { error: "Tanggal lahir tidak valid." };

  // KTP disimpan di kolom `nik` (16 digit, unik per bisnis — dipakai Portal Karyawan);
  // jenis identitas lain disimpan di `id_number`.
  const idType = str(fd, "id_type") || "KTP";
  const idRaw = str(fd, "id_number").replace(/[\s.-]/g, "");
  if (idType === "KTP" && !/^\d{16}$/.test(idRaw)) return { error: "NIK (KTP) harus 16 digit angka." };

  const payload = {
    name,
    birth_place: str(fd, "birth_place"),
    birth_date: birthDate,
    gender: str(fd, "gender") === "P" ? "P" : "L",
    marital_status: str(fd, "marital_status"),
    blood_type: strOrNull(fd, "blood_type"),
    religion: str(fd, "religion"),
    citizenship: str(fd, "citizenship") === "WNA" ? "WNA" : "WNI",
    citizenship_country: strOrNull(fd, "citizenship_country"),
    id_type: idType,
    nik: idType === "KTP" ? idRaw : null,
    id_number: idType === "KTP" ? null : idRaw,
    family_card_number: strOrNull(fd, "family_card_number"),
    email: str(fd, "email"),
    phone: str(fd, "phone"),
    phone_alt: strOrNull(fd, "phone_alt"),
    id_address: str(fd, "id_address"),
    id_country: str(fd, "id_country") || "Indonesia",
    id_province: str(fd, "id_province"),
    id_city: str(fd, "id_city"),
    domicile_same: domicileSame,
    dom_address: domicileSame ? str(fd, "id_address") : str(fd, "dom_address"),
    dom_country: domicileSame ? str(fd, "id_country") || "Indonesia" : str(fd, "dom_country") || "Indonesia",
    dom_province: domicileSame ? str(fd, "id_province") : str(fd, "dom_province"),
    dom_city: domicileSame ? str(fd, "id_city") : str(fd, "dom_city"),
    emergency_name: str(fd, "emergency_name"),
    emergency_phone: str(fd, "emergency_phone"),
    edu_level: strOrNull(fd, "edu_level"),
    edu_institution: strOrNull(fd, "edu_institution"),
    edu_major: strOrNull(fd, "edu_major"),
  };

  let id = employeeId;
  if (id) {
    const { error } = await supabase
      .from("employees")
      .update(payload)
      .eq("id", id)
      .eq("business_id", businessId);
    if (error) return { error: identityDbError(error) };
  } else {
    // Dua pembuatan bersamaan bisa menghasilkan kode yang sama (unique index) → coba ulang sekali.
    for (let attempt = 0; attempt < 2 && !id; attempt++) {
      const code = await nextEmployeeCode(supabase, businessId);
      const { data, error } = await supabase
        .from("employees")
        .insert({
          business_id: businessId,
          employee_code: code,
          salary_type: "bulanan",
          setup_complete: false,
          ...payload,
        })
        .select("id")
        .single();
      if (!error) id = data.id;
      else if (attempt === 1 || !error.message.includes("employees_business_code_uniq")) {
        return { error: identityDbError(error) };
      }
    }
    await logActivity(supabase, businessId, "Karyawan ditambahkan", name);
  }

  revalidatePath(`/business/${businessId}/employees`);
  redirect(`/business/${businessId}/employees/${id}/setup/2`);
}

/** Langkah 2 — Kepegawaian. */
export async function saveStep2(
  businessId: string,
  employeeId: string,
  _prev: WizardState,
  fd: FormData,
): Promise<WizardState> {
  const supabase = await createClient();

  const status = str(fd, "employment_status");
  if (!EMPLOYMENT_STATUSES.some((s) => s.value === status)) return { error: "Status karyawan wajib dipilih." };
  const joinDate = toIsoDate(str(fd, "join_date"));
  if (!joinDate) return { error: "Tanggal bergabung wajib diisi." };
  for (const [key, label] of [
    ["placement_type", "Penempatan kerja"],
    ["organization_id", "Organisasi"],
    ["position_id", "Jabatan"],
    ["rank_id", "Pangkat"],
  ] as const) {
    if (!str(fd, key)) return { error: `${label} wajib dipilih.` };
  }
  const needsEnd = CONTRACT_STATUSES.includes(status);
  const contractEnd = needsEnd ? toIsoDate(str(fd, "contract_end")) : null;

  const { data: position } = await supabase
    .from("positions")
    .select("name")
    .eq("id", str(fd, "position_id"))
    .eq("business_id", businessId)
    .maybeSingle();

  const { data: beforeCareer } = await supabase
    .from("employees")
    .select("employment_status, placement_type, organization_id, position_id, rank_id")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .maybeSingle();

  const { error } = await supabase
    .from("employees")
    .update({
      employment_status: status,
      join_date: joinDate,
      placement_type: str(fd, "placement_type"),
      organization_id: str(fd, "organization_id"),
      position_id: str(fd, "position_id"),
      rank_id: str(fd, "rank_id"),
      grade: strOrNull(fd, "grade"),
      contract_end: contractEnd,
      // `note` dipakai UI portal absen sebagai label jabatan — selaraskan.
      note: position?.name ?? null,
    })
    .eq("id", employeeId)
    .eq("business_id", businessId);
  if (error) return { error: error.message };

  // Riwayat karir: pertama kali diisi → berlaku sejak tanggal bergabung, perubahan berikutnya → hari ini.
  await recordCareerChange(
    supabase,
    businessId,
    employeeId,
    beforeCareer ?? null,
    {
      employment_status: status,
      placement_type: str(fd, "placement_type"),
      organization_id: str(fd, "organization_id"),
      position_id: str(fd, "position_id"),
      rank_id: str(fd, "rank_id"),
    },
    beforeCareer?.organization_id ? null : joinDate,
  );

  revalidatePath(`/business/${businessId}/employees`);
  redirect(`/business/${businessId}/employees/${employeeId}/setup/3`);
}

/** Langkah 3 — Payroll (gaji, NPWP, BPJS, rekening). Menandai karyawan lengkap. */
export async function saveStep3(
  businessId: string,
  employeeId: string,
  _prev: WizardState,
  fd: FormData,
): Promise<WizardState> {
  const supabase = await createClient();

  const salaryType = str(fd, "salary_type");
  if (salaryType !== "harian" && salaryType !== "bulanan") return { error: "Tipe gaji tidak valid." };
  const ptkp = str(fd, "ptkp_status") || "TK/0";
  if (!PTKP_OPTIONS.includes(ptkp)) return { error: "Status PTKP tidak valid." };

  // Rekening gaji memakai kolom bank_* yang sama dengan form Edit & Portal Karyawan.
  const identity = parseIdentity({
    bank_name: fd.get("bank_name"),
    bank_account_number: fd.get("bank_account_number"),
    bank_account_name: fd.get("bank_account_name"),
  });
  if ("error" in identity) return identity;

  // PIN absen: kosong = tidak diubah.
  const pin = str(fd, "attendance_pin");
  if (pin && !PIN_PATTERN.test(pin)) return { error: "PIN absen harus 4 digit angka." };
  const wageRaw = str(fd, "bpjs_wage_base");
  const wage = wageRaw ? Number(wageRaw) : null;

  const { data: beforeSalary } = await supabase
    .from("employees")
    .select("salary_type, daily_rate, monthly_rate, daily_meal_allowance, daily_attendance_allowance")
    .eq("id", employeeId)
    .eq("business_id", businessId)
    .maybeSingle();

  const { error } = await supabase
    .from("employees")
    .update({
      bank_name: identity.value.bank_name,
      bank_account_number: identity.value.bank_account_number,
      bank_account_name: identity.value.bank_account_name,
      bpjs_kesehatan: fd.get("bpjs_kesehatan") === "on",
      bpjs_ketenagakerjaan: fd.get("bpjs_ketenagakerjaan") === "on",
      bpjs_wage_base: wage !== null && Number.isFinite(wage) && wage > 0 ? wage : null,
      ...(pin && { attendance_pin_hash: await hashPin(pin) }),
      salary_type: salaryType,
      daily_rate: salaryType === "harian" ? num(fd, "daily_rate") : 0,
      monthly_rate: salaryType === "bulanan" ? num(fd, "monthly_rate") : 0,
      daily_meal_allowance: num(fd, "daily_meal_allowance"),
      daily_attendance_allowance: num(fd, "daily_attendance_allowance"),
      lembur_rate_per_hour: str(fd, "lembur_rate_per_hour") ? num(fd, "lembur_rate_per_hour") : null,
      ptkp_status: ptkp,
      npwp: strOrNull(fd, "npwp"),
      bpjs_tk_number: strOrNull(fd, "bpjs_tk_number"),
      bpjs_tk_effective: toIsoDate(str(fd, "bpjs_tk_effective")),
      bpjs_kes_number: strOrNull(fd, "bpjs_kes_number"),
      bpjs_kes_effective: toIsoDate(str(fd, "bpjs_kes_effective")),
      bpjs_family_count: str(fd, "bpjs_family_count") ? Math.max(0, Math.round(num(fd, "bpjs_family_count"))) : null,
      setup_complete: true,
    })
    .eq("id", employeeId)
    .eq("business_id", businessId);
  if (error) return { error: identityDbError(error) };

  await recordSalaryChange(
    supabase,
    businessId,
    employeeId,
    beforeSalary ?? null,
    {
      salary_type: salaryType,
      daily_rate: salaryType === "harian" ? num(fd, "daily_rate") : 0,
      monthly_rate: salaryType === "bulanan" ? num(fd, "monthly_rate") : 0,
      daily_meal_allowance: num(fd, "daily_meal_allowance"),
      daily_attendance_allowance: num(fd, "daily_attendance_allowance"),
    },
    null,
  );

  revalidatePath(`/business/${businessId}/employees`);
  redirect(`/business/${businessId}/employees/${employeeId}`);
}

export type MasterKind = "organizations" | "positions" | "ranks";
const MASTER_LABEL: Record<MasterKind, string> = {
  organizations: "Organisasi",
  positions: "Jabatan",
  ranks: "Pangkat",
};

/** Tambah data master langsung dari dropdown ("+ Tambah …"). */
export async function createMaster(
  businessId: string,
  kind: MasterKind,
  name: string,
): Promise<{ id: string | null; error: string | null }> {
  const clean = name.trim();
  if (!clean) return { id: null, error: `Nama ${MASTER_LABEL[kind].toLowerCase()} wajib diisi.` };
  if (!(kind in MASTER_LABEL)) return { id: null, error: "Jenis data tidak valid." };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from(kind)
    .insert({ business_id: businessId, name: clean })
    .select("id")
    .single();
  if (error) {
    return {
      id: null,
      error: error.message.includes("duplicate") ? `${MASTER_LABEL[kind]} "${clean}" sudah ada.` : error.message,
    };
  }
  return { id: data.id, error: null };
}
