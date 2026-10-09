// Data identitas & rekening karyawan — dipakai form karyawan dan import CSV
// supaya aturan validasinya sama.

export const BANK_OPTIONS = [
  "BCA",
  "BRI",
  "BNI",
  "Mandiri",
  "BSI",
  "CIMB Niaga",
  "Permata",
  "Danamon",
  "BTN",
  "Bank Jago",
  "SeaBank",
  "Jenius (BTPN)",
  "OCBC",
  "Panin",
  "Maybank",
  "DANA",
  "GoPay",
  "OVO",
  "ShopeePay",
];

export type EmployeeIdentity = {
  nik: string | null;
  join_date: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  bank_account_name: string | null;
};

const clean = (v: unknown) => (typeof v === "string" ? v.trim() : "");

/** Validasi + normalisasi. Kosong = null. Mengembalikan pesan error bahasa Indonesia. */
export function parseIdentity(raw: {
  nik?: unknown;
  join_date?: unknown;
  bank_name?: unknown;
  bank_account_number?: unknown;
  bank_account_name?: unknown;
}): { error: string } | { value: EmployeeIdentity } {
  const nik = clean(raw.nik).replace(/[\s.-]/g, "");
  if (nik && !/^\d{16}$/.test(nik)) return { error: "NIK harus 16 digit angka." };

  const joinDate = clean(raw.join_date);
  if (joinDate) {
    const d = new Date(`${joinDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(joinDate) || Number.isNaN(d.getTime())) {
      return { error: "Tanggal masuk kerja tidak valid." };
    }
  }

  const bankName = clean(raw.bank_name).slice(0, 60);
  const accountNumber = clean(raw.bank_account_number).replace(/[\s.-]/g, "");
  const accountName = clean(raw.bank_account_name).slice(0, 100);
  if (accountNumber && !/^\d{5,20}$/.test(accountNumber)) {
    return { error: "Nomor rekening harus 5–20 digit angka." };
  }
  if (accountNumber && !bankName) return { error: "Pilih nama bank untuk nomor rekening ini." };
  if (bankName && !accountNumber) return { error: "Isi nomor rekening untuk bank yang dipilih." };

  return {
    value: {
      nik: nik || null,
      join_date: joinDate || null,
      bank_name: bankName || null,
      bank_account_number: accountNumber || null,
      bank_account_name: accountName || null,
    },
  };
}

/** Pesan ramah untuk error database yang mungkin muncul dari kolom identitas. */
export function identityDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505" && error.message.includes("employees_business_nik_uniq")) {
    return "NIK ini sudah dipakai karyawan lain.";
  }
  return error.message;
}

/** "2 tahun 3 bulan" / "5 bulan" / "Baru masuk" dari tanggal masuk. */
export function tenureLabel(joinDate: string, today = new Date()): string {
  const [y, m, d] = joinDate.split("-").map(Number);
  let months = (today.getUTCFullYear() - y) * 12 + (today.getUTCMonth() + 1 - m);
  if (today.getUTCDate() < d) months -= 1;
  if (months < 1) return "Baru masuk";
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return [years > 0 ? `${years} tahun` : "", rest > 0 ? `${rest} bulan` : ""].filter(Boolean).join(" ");
}
