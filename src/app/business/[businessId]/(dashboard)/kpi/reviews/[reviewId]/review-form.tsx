"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, Field, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import { gradeOf, weightedScore } from "@/lib/kpi/score";
import { saveKpiReview } from "../../actions";

type Row = { id: string; name: string; description: string; weight: number; score: number | null; note: string };

export default function ReviewForm({
  businessId,
  reviewId,
  done,
  notes: initialNotes,
  indicators,
}: {
  businessId: string;
  reviewId: string;
  done: boolean;
  notes: string;
  indicators: Row[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(indicators);
  const [notes, setNotes] = useState(initialNotes);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const update = (i: number, patch: Partial<Row>) => setRows((l) => l.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  const complete = rows.every((r) => r.score !== null);
  const total = complete ? weightedScore(rows.map((r) => ({ score: r.score ?? 0, weight: r.weight }))) : null;
  const grade = gradeOf(total);

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveKpiReview(
        businessId,
        reviewId,
        rows.map((r) => ({ indicator_id: r.id, score: r.score ?? NaN, note: r.note })),
        notes,
      );
      if (res.error) setError(res.error);
      else router.push(`/business/${businessId}/kpi/reviews`);
    });
  }

  return (
    <div className="space-y-4">
      {rows.length === 0 && (
        <Card>
          <p className="text-sm text-zinc-500">Formulir ini tidak punya indikator.</p>
        </Card>
      )}
      {rows.map((r, i) => (
        <Card key={r.id}>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[14px] font-semibold text-zinc-900">{r.name}</p>
              {r.description && <p className="mt-0.5 text-xs text-zinc-400">{r.description}</p>}
            </div>
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-0.5 text-[12px] font-semibold text-brand-700">Bobot {r.weight}%</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-[180px_1fr]">
            <Field label="Nilai (0–100)" required>
              <input
                type="number"
                min={0}
                max={100}
                value={r.score ?? ""}
                onChange={(e) => update(i, { score: e.target.value === "" ? null : Number(e.target.value) })}
                className={inputClass}
              />
            </Field>
            <Field label="Catatan">
              <input value={r.note} onChange={(e) => update(i, { note: e.target.value })} className={inputClass} placeholder="Opsional" />
            </Field>
          </div>
        </Card>
      ))}

      <Card>
        <Field label="Catatan Penilai">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className={inputClass} placeholder="Ringkasan, saran, atau tindak lanjut" />
        </Field>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-zinc-50 px-4 py-3">
          <span className="text-sm text-zinc-600">Nilai akhir (tertimbang)</span>
          <span className="flex items-center gap-3">
            <span className="text-2xl font-bold text-zinc-900">{total === null ? "—" : total.toLocaleString("id-ID")}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${grade.badge}`}>{grade.label}</span>
          </span>
        </div>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href={`/business/${businessId}/kpi/reviews`} className={btnOutline}>
          Batal
        </Link>
        <button type="button" onClick={submit} disabled={pending || !complete} className={btnPrimary}>
          {pending ? "Menyimpan…" : done ? "Simpan Perubahan" : "Simpan Penilaian"}
        </button>
      </div>
    </div>
  );
}
