export const REIMBURSEMENT_CATEGORIES: Record<string, string> = {
  transport: "Transportasi",
  makan: "Makan & minum",
  akomodasi: "Akomodasi",
  kesehatan: "Kesehatan",
  perlengkapan: "Perlengkapan kerja",
  lainnya: "Lainnya",
};

export function reimbursementCategoryLabel(key: string) {
  return REIMBURSEMENT_CATEGORIES[key] ?? "Lainnya";
}
