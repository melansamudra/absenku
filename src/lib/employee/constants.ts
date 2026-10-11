// Pilihan dropdown untuk profil karyawan — mengikuti isian GajiHub
// (lihat docs/gajihub-spec.md bagian 4).

export const MARITAL_STATUSES = ["Menikah", "Belum Menikah", "Janda", "Duda"];
export const RELIGIONS = ["Islam", "Kristen", "Katolik", "Hindu", "Budha", "Konghucu", "Lainnya"];
export const BLOOD_TYPES = ["A", "B", "AB", "O"];
export const ID_TYPES = ["KTP", "Paspor", "SIM", "KITAS"];
export const EDU_LEVELS = ["SD", "SMP", "SMA/SMK", "D1", "D2", "D3", "D4", "S1", "S2", "S3"];

export const EMPLOYMENT_STATUSES = [
  { value: "tetap", label: "Tetap Permanen" },
  { value: "percobaan", label: "Tetap Percobaan" },
  { value: "pkwt", label: "PKWT" },
  { value: "lepas", label: "Pekerja Lepas" },
  { value: "tenaga_ahli", label: "Tenaga Ahli" },
  { value: "magang", label: "Magang" },
  { value: "mitra", label: "Mitra" },
] as const;

// Status yang punya tanggal masa akhir kerja (kontrak).
export const CONTRACT_STATUSES = ["pkwt", "percobaan", "magang", "mitra", "lepas", "tenaga_ahli"];

export const PLACEMENT_TYPES = [
  "Baru Direkrut",
  "Demosi",
  "Diangkat Karyawan Tetap",
  "Mutasi",
  "Promosi",
  "Rotasi",
];

export const PTKP_OPTIONS = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];

export const PROVINCES = [
  "Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Kepulauan Riau", "Jambi", "Sumatera Selatan",
  "Kepulauan Bangka Belitung", "Bengkulu", "Lampung", "DKI Jakarta", "Banten", "Jawa Barat", "Jawa Tengah",
  "D I Yogyakarta", "Jawa Timur", "Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur", "Kalimantan Barat",
  "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara", "Sulawesi Utara",
  "Gorontalo", "Sulawesi Tengah", "Sulawesi Barat", "Sulawesi Selatan", "Sulawesi Tenggara", "Maluku",
  "Maluku Utara", "Papua", "Papua Barat", "Papua Selatan", "Papua Tengah", "Papua Pegunungan", "Papua Barat Daya",
];

export const BANKS = [
  "BCA", "BRI", "BNI", "Mandiri", "BSI", "CIMB Niaga", "Permata", "Danamon", "OCBC NISP", "BTN",
  "Maybank", "Panin", "Mega", "Bank Jago", "SeaBank", "Jenius (BTPN)", "Lainnya",
];

export function employmentLabel(value: string | null) {
  return EMPLOYMENT_STATUSES.find((s) => s.value === value)?.label ?? "Tetap Permanen";
}
