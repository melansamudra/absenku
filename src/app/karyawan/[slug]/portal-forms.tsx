"use client";

import { useActionState, useState } from "react";
import {
  loginPortal,
  submitOvertimeRequest,
  type PortalActionState,
} from "./actions";

const initialState: PortalActionState = { error: null };

const inputClass =
  "w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100";

export function PortalLoginForm({
  slug,
  employees,
}: {
  slug: string;
  employees: { id: string; name: string; note: string | null }[];
}) {
  const [state, formAction, pending] = useActionState(
    (prev: PortalActionState, formData: FormData) => loginPortal(slug, prev, formData),
    initialState,
  );
  const [pin, setPin] = useState("");

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-600">Nama</label>
        <select name="employee_id" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            — Pilih nama —
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
              {e.note ? ` (${e.note})` : ""}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-medium text-zinc-600">PIN Absen</label>
        <input
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={6}
          required
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          placeholder="4–6 digit"
          className={`${inputClass} tracking-widest`}
        />
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Memeriksa…" : "Masuk"}
      </button>
    </form>
  );
}

export function OvertimeRequestForm({ slug, today }: { slug: string; today: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: PortalActionState, formData: FormData) => submitOvertimeRequest(slug, prev, formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal</label>
          <input name="date" type="date" required max={today} defaultValue={today} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Jam Lembur</label>
          <input
            name="hours"
            type="number"
            required
            min={0.5}
            max={12}
            step={0.5}
            placeholder="mis. 2"
            className={inputClass}
          />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Keterangan (opsional)</label>
        <input name="reason" maxLength={300} placeholder="mis. stok opname" className={inputClass} />
      </div>
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
      )}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.success}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Ajukan Lembur"}
      </button>
    </form>
  );
}
