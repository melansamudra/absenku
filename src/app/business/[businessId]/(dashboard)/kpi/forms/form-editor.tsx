"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Card, Field, SectionTitle, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import { saveKpiForm, type IndicatorInput } from "../actions";

type Initial = {
  id: string | null;
  name: string;
  description: string;
  status: "draft" | "active";
  indicators: IndicatorInput[];
  locked: boolean;
};

export default function KpiFormEditor({ businessId, initial }: { businessId: string; initial: Initial }) {
  const router = useRouter();
  const [name, setName] = useState(initial.name);
  const [description, setDescription] = useState(initial.description);
  const [status, setStatus] = useState(initial.status);
  const [rows, setRows] = useState<IndicatorInput[]>(
    initial.indicators.length > 0 ? initial.indicators : [{ name: "", description: "", weight: 0 }],
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const total = Math.round(rows.reduce((t, r) => t + (Number(r.weight) || 0), 0) * 100) / 100;
  const ok = Math.abs(total - 100) < 0.01;
  const update = (i: number, patch: Partial<IndicatorInput>) =>
    setRows((l) => l.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await saveKpiForm(businessId, initial.id, { name, description, status, indicators: rows });
      if (res.error) setError(res.error);
      else router.push(`/business/${businessId}/kpi/forms`);
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Informasi Formulir</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Formulir" required className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="mis. KPI Staf Operasional" />
          </Field>
          <Field label="Deskripsi" className="sm:col-span-2">
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputClass} />
          </Field>
          <Field label="Status" hint="Hanya formulir Tersedia yang bisa dijadwalkan. Bobot harus total 100%.">
            <select value={status} onChange={(e) => setStatus(e.target.value as "draft" | "active")} className={inputClass}>
              <option value="draft">Draft</option>
              <option value="active">Tersedia</option>
            </select>
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-sm font-bold text-zinc-900">Indikator Penilaian</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${ok ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            Total bobot {total}% {ok ? "✓" : "(harus 100%)"}
          </span>
        </div>

        {initial.locked && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
            Formulir ini sudah dipakai di jadwal penilaian, jadi indikatornya dikunci agar nilai lama tidak berubah. Anda tetap bisa mengubah nama, deskripsi, dan status.
          </p>
        )}

        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="grid items-start gap-3 rounded-xl border border-zinc-100 p-3 sm:grid-cols-[1fr_1fr_110px_auto]">
              <Field label="Indikator">
                <input value={r.name} disabled={initial.locked} onChange={(e) => update(i, { name: e.target.value })} className={inputClass} placeholder="mis. Ketepatan waktu" />
              </Field>
              <Field label="Deskripsi / target">
                <input value={r.description} disabled={initial.locked} onChange={(e) => update(i, { description: e.target.value })} className={inputClass} />
              </Field>
              <Field label="Bobot (%)">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step="0.5"
                  value={r.weight}
                  disabled={initial.locked}
                  onChange={(e) => update(i, { weight: Number(e.target.value) })}
                  className={inputClass}
                />
              </Field>
              <button
                type="button"
                disabled={initial.locked || rows.length === 1}
                onClick={() => setRows((l) => l.filter((_, idx) => idx !== i))}
                className="mt-6 rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                aria-label="Hapus indikator"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {!initial.locked && (
            <button type="button" onClick={() => setRows((l) => [...l, { name: "", description: "", weight: 0 }])} className={btnOutline}>
              <Plus size={14} /> Tambah Indikator
            </button>
          )}
        </div>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href={`/business/${businessId}/kpi/forms`} className={btnOutline}>
          Batal
        </Link>
        <button type="button" onClick={submit} disabled={pending} className={btnPrimary}>
          {pending ? "Menyimpan…" : "Simpan Formulir"}
        </button>
      </div>
    </div>
  );
}
