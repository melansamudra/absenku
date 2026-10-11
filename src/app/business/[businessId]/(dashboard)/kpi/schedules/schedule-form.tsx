"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Card, Field, SectionTitle, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import { createKpiSchedule } from "../actions";

export default function ScheduleForm({
  businessId,
  forms,
  employees,
}: {
  businessId: string;
  forms: { id: string; name: string }[];
  employees: { id: string; name: string; sub: string }[];
}) {
  const router = useRouter();
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  const [name, setName] = useState("");
  const [formId, setFormId] = useState(forms[0]?.id ?? "");
  const [start, setStart] = useState(today.slice(0, 8) + "01");
  const [end, setEnd] = useState(today);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const toggle = (id: string) =>
    setPicked((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const allPicked = employees.length > 0 && picked.size === employees.length;

  function submit() {
    setError(null);
    startTransition(async () => {
      const r = await createKpiSchedule(businessId, {
        name,
        form_id: formId,
        observe_start: start,
        observe_end: end,
        employee_ids: [...picked],
      });
      if (r.error) setError(r.error);
      else router.push(`/business/${businessId}/kpi/reviews`);
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle>Jadwal Penilaian</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nama Jadwal" required className="sm:col-span-2">
            <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} placeholder="mis. Penilaian Semester 1 2026" />
          </Field>
          <Field label="Formulir KPI" required className="sm:col-span-2">
            {forms.length === 0 ? (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
                Belum ada formulir berstatus Tersedia.{" "}
                <Link href={`/business/${businessId}/kpi/forms`} className="font-semibold underline">
                  Buat formulir dulu
                </Link>
                .
              </p>
            ) : (
              <select value={formId} onChange={(e) => setFormId(e.target.value)} className={inputClass}>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Mulai Observasi" required>
            <input type="date" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          </Field>
          <Field label="Selesai Observasi" required>
            <input type="date" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          </Field>
        </div>
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between border-b border-zinc-100 pb-2">
          <h3 className="text-sm font-bold text-zinc-900">Karyawan yang Dinilai ({picked.size})</h3>
          <button
            type="button"
            onClick={() => setPicked(allPicked ? new Set() : new Set(employees.map((e) => e.id)))}
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            {allPicked ? "Hapus semua" : "Pilih semua"}
          </button>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {employees.map((e) => (
            <label key={e.id} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 ${picked.has(e.id) ? "border-brand-400 bg-brand-50" : "border-zinc-100 hover:bg-zinc-50"}`}>
              <input type="checkbox" checked={picked.has(e.id)} onChange={() => toggle(e.id)} className="h-4 w-4 accent-[var(--color-brand-600)]" />
              <span>
                <span className="block text-[13px] font-medium text-zinc-900">{e.name}</span>
                <span className="block text-xs text-zinc-400">{e.sub}</span>
              </span>
            </label>
          ))}
          {employees.length === 0 && <p className="text-sm text-zinc-400">Belum ada karyawan aktif.</p>}
        </div>
      </Card>

      {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Link href={`/business/${businessId}/kpi/schedules`} className={btnOutline}>
          Batal
        </Link>
        <button type="button" onClick={submit} disabled={pending || forms.length === 0} className={btnPrimary}>
          {pending ? "Menyimpan…" : "Simpan Jadwal"}
        </button>
      </div>
    </div>
  );
}
