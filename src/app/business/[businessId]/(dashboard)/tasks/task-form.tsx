"use client";

import { useActionState, useEffect, useRef } from "react";
import { createTask, type TaskActionState } from "./actions";

const initialState: TaskActionState = { error: null };
const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm";

export default function TaskForm({
  businessId,
  employees,
}: {
  businessId: string;
  employees: { id: string; name: string }[];
}) {
  const [state, formAction, pending] = useActionState(
    (prev: TaskActionState, formData: FormData) => createTask(businessId, prev, formData),
    initialState,
  );
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form
      ref={formRef}
      action={(formData) => {
        hasSubmitted.current = true;
        formAction(formData);
      }}
      className="space-y-3"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Karyawan</label>
          <select name="employee_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              — Pilih karyawan —
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Tenggat (opsional)</label>
          <input name="due_date" type="date" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Judul tugas</label>
        <input name="title" required maxLength={200} placeholder="mis. Stok opname gudang" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Detail (opsional)</label>
        <textarea name="description" rows={3} maxLength={1000} className={inputClass} />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Beri Tugas"}
      </button>
    </form>
  );
}
