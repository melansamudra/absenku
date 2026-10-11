// Perhitungan nilai KPI: skor per indikator 0–100, nilai akhir = rata-rata tertimbang bobot.

export function weightedScore(items: { score: number; weight: number }[]): number {
  const totalWeight = items.reduce((t, i) => t + i.weight, 0);
  if (totalWeight <= 0) return 0;
  const sum = items.reduce((t, i) => t + i.score * i.weight, 0);
  return Math.round((sum / totalWeight) * 100) / 100;
}

export type Grade = { label: string; badge: string };

export function gradeOf(score: number | null): Grade {
  if (score == null) return { label: "Belum dinilai", badge: "bg-zinc-100 text-zinc-500" };
  if (score >= 90) return { label: "Sangat Baik", badge: "bg-emerald-50 text-emerald-700" };
  if (score >= 75) return { label: "Baik", badge: "bg-brand-100 text-brand-800" };
  if (score >= 60) return { label: "Cukup", badge: "bg-amber-50 text-amber-700" };
  return { label: "Perlu Perbaikan", badge: "bg-red-50 text-red-600" };
}
