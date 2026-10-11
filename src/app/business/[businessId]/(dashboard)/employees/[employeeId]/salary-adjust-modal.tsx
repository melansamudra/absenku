"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Plus, X } from "lucide-react";
import { Field, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import { adjustSalary, type AdjustState } from "./history-actions";

const initial: AdjustState = { error: null };

export default function SalaryAdjustModal({
  businessId,
  employeeId,
  current,
}: {
  businessId: string;
  employeeId: string;
  current: {
    salary_type: "harian" | "bulanan";
    daily_rate: number;
    monthly_rate: number;
    daily_meal_allowance: number;
    daily_attendance_allowance: number;
  };
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(current.salary_type);
  const [state, formAction, pending] = useActionState(adjustSalary.bind(null, businessId, employeeId), initial);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) {
      submitted.current = false;
      setOpen(false);
    }
  }, [pending, state.error]);

  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={btnPrimary}>
        <Plus size={15} /> Penyesuaian Gaji
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Penyesuaian Gaji</h2>
                <p className="text-xs text-zinc-400">Gaji baru dipakai mulai slip gaji berikutnya.</p>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100" aria-label="Tutup">
                <X size={18} />
              </button>
            </div>
            <form
              action={(fd) => {
                submitted.current = true;
                formAction(fd);
              }}
              className="space-y-4"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tanggal Efektif" required>
                  <input name="effective_date" type="date" defaultValue={today} className={inputClass} />
                </Field>
                <Field label="Tipe Gaji" required>
                  <select name="salary_type" value={type} onChange={(e) => setType(e.target.value as "harian" | "bulanan")} className={inputClass}>
                    <option value="bulanan">Bulanan</option>
                    <option value="harian">Harian</option>
                  </select>
                </Field>
                {type === "harian" ? (
                  <Field label="Gaji per Hari (Rp)" required>
                    <input name="daily_rate" type="number" min={0} step={1000} defaultValue={current.daily_rate || ""} className={inputClass} />
                  </Field>
                ) : (
                  <Field label="Gaji Pokok per Bulan (Rp)" required>
                    <input name="monthly_rate" type="number" min={0} step={1000} defaultValue={current.monthly_rate || ""} className={inputClass} />
                  </Field>
                )}
                <Field label="Uang Makan / hari hadir (Rp)">
                  <input name="daily_meal_allowance" type="number" min={0} step={1000} defaultValue={current.daily_meal_allowance} className={inputClass} />
                </Field>
                <Field label="Tunjangan Hadir / hari (Rp)">
                  <input name="daily_attendance_allowance" type="number" min={0} step={1000} defaultValue={current.daily_attendance_allowance} className={inputClass} />
                </Field>
                <Field label="Keterangan" className="sm:col-span-2">
                  <input name="note" className={inputClass} placeholder="mis. Kenaikan gaji tahunan" />
                </Field>
              </div>
              {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setOpen(false)} className={btnOutline}>
                  Batal
                </button>
                <button type="submit" disabled={pending} className={btnPrimary}>
                  {pending ? "Menyimpan…" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
