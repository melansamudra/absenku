"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity-log";
import { identityDbError, parseIdentity, type EmployeeIdentity } from "@/lib/employees/identity";

export type ImportState = {
  error: string | null;
  importedCount: number;
  rowErrors: string[];
};

const HEADER_ALIASES: Record<string, string> = {
  nama: "name",
  name: "name",
  tipe_gaji: "salary_type",
  salary_type: "salary_type",
  tipe: "salary_type",
  gaji_harian: "daily_rate",
  daily_rate: "daily_rate",
  gaji_bulanan: "monthly_rate",
  monthly_rate: "monthly_rate",
  divisi: "note",
  jabatan: "note",
  note: "note",
  email: "email",
  nik: "nik",
  tanggal_masuk: "join_date",
  join_date: "join_date",
  bank: "bank_name",
  nama_bank: "bank_name",
  bank_name: "bank_name",
  no_rekening: "bank_account_number",
  nomor_rekening: "bank_account_number",
  bank_account_number: "bank_account_number",
  atas_nama: "bank_account_name",
  nama_rekening: "bank_account_name",
  bank_account_name: "bank_account_name",
};

// Parser CSV minimal yang menangani field berkutip (mendukung koma/petik di
// dalam field) — bukan parser RFC4180 penuh, tapi cukup untuk file yang
// diekspor dari Excel/Google Sheets.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // skip — dinormalkan lewat \n
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

export async function importEmployeesCsv(
  businessId: string,
  _prevState: ImportState,
  formData: FormData,
): Promise<ImportState> {
  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Pilih file CSV dulu.", importedCount: 0, rowErrors: [] };
  }

  const text = await file.text();
  const rows = parseCsv(text);

  if (rows.length < 2) {
    return { error: "File kosong atau tidak ada baris data.", importedCount: 0, rowErrors: [] };
  }

  const headerRow = rows[0].map((h) => HEADER_ALIASES[h.trim().toLowerCase()] ?? null);
  const nameIdx = headerRow.indexOf("name");
  if (nameIdx === -1) {
    return {
      error: 'Kolom "nama" wajib ada di header CSV.',
      importedCount: 0,
      rowErrors: [],
    };
  }

  const salaryTypeIdx = headerRow.indexOf("salary_type");
  const dailyRateIdx = headerRow.indexOf("daily_rate");
  const monthlyRateIdx = headerRow.indexOf("monthly_rate");
  const noteIdx = headerRow.indexOf("note");
  const emailIdx = headerRow.indexOf("email");
  const identityIdx = {
    nik: headerRow.indexOf("nik"),
    join_date: headerRow.indexOf("join_date"),
    bank_name: headerRow.indexOf("bank_name"),
    bank_account_number: headerRow.indexOf("bank_account_number"),
    bank_account_name: headerRow.indexOf("bank_account_name"),
  };

  const validRows: ({
    business_id: string;
    name: string;
    salary_type: string;
    daily_rate: number;
    monthly_rate: number;
    note: string | null;
    email: string | null;
  } & EmployeeIdentity)[] = [];
  const rowErrors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i];
    const rowNum = i + 1; // baris di file, header = baris 1
    const name = (cells[nameIdx] ?? "").trim();

    if (!name) {
      rowErrors.push(`Baris ${rowNum}: nama kosong, dilewati.`);
      continue;
    }

    let salaryType = salaryTypeIdx >= 0 ? (cells[salaryTypeIdx] ?? "").trim().toLowerCase() : "harian";
    if (!salaryType) salaryType = "harian";
    if (salaryType !== "harian" && salaryType !== "bulanan") {
      rowErrors.push(`Baris ${rowNum}: tipe_gaji "${salaryType}" tidak valid, dilewati.`);
      continue;
    }

    const dailyRate = dailyRateIdx >= 0 ? Number(cells[dailyRateIdx] ?? 0) || 0 : 0;
    const monthlyRate = monthlyRateIdx >= 0 ? Number(cells[monthlyRateIdx] ?? 0) || 0 : 0;
    const note = noteIdx >= 0 ? (cells[noteIdx] ?? "").trim() || null : null;
    const email = emailIdx >= 0 ? (cells[emailIdx] ?? "").trim() || null : null;

    const cell = (idx: number) => (idx >= 0 ? (cells[idx] ?? "") : "");
    const identity = parseIdentity({
      nik: cell(identityIdx.nik),
      join_date: cell(identityIdx.join_date),
      bank_name: cell(identityIdx.bank_name),
      bank_account_number: cell(identityIdx.bank_account_number),
      bank_account_name: cell(identityIdx.bank_account_name),
    });
    if ("error" in identity) {
      rowErrors.push(`Baris ${rowNum}: ${identity.error} Dilewati.`);
      continue;
    }

    validRows.push({
      ...identity.value,
      business_id: businessId,
      name,
      salary_type: salaryType,
      daily_rate: dailyRate,
      monthly_rate: monthlyRate,
      note,
      email,
    });
  }

  if (validRows.length === 0) {
    return {
      error: "Tidak ada baris valid untuk diimpor.",
      importedCount: 0,
      rowErrors,
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("employees").insert(validRows);

  if (error) {
    return { error: identityDbError(error), importedCount: 0, rowErrors };
  }

  await logActivity(
    supabase,
    businessId,
    "Import karyawan dari CSV",
    `${validRows.length} karyawan ditambahkan`,
  );

  revalidatePath(`/business/${businessId}/employees`);
  return { error: null, importedCount: validRows.length, rowErrors };
}
