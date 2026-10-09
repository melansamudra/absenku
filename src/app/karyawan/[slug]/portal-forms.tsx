"use client";

import { useActionState, useState } from "react";
import { REIMBURSEMENT_CATEGORIES } from "@/lib/reimbursement/categories";
import {
  loginPortal,
  submitActivity,
  submitOvertimeRequest,
  submitReimbursement,
  updateTaskStatus,
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

function FormMessages({ state }: { state: PortalActionState }) {
  return (
    <>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{state.success}</p>
      )}
    </>
  );
}

export function ReimbursementForm({ slug, today }: { slug: string; today: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: PortalActionState, formData: FormData) => submitReimbursement(slug, prev, formData),
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
          <label className="mb-1 block text-xs font-medium text-zinc-600">Kategori</label>
          <select name="category" defaultValue="transport" className={inputClass}>
            {Object.entries(REIMBURSEMENT_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Nominal (Rp)</label>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={50000000}
          step={1}
          placeholder="mis. 50000"
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Keterangan</label>
        <input name="description" required maxLength={300} placeholder="mis. bensin ke klien" className={inputClass} />
      </div>
      <FormMessages state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Ajukan Klaim"}
      </button>
    </form>
  );
}

export function ActivityForm({ slug, today }: { slug: string; today: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: PortalActionState, formData: FormData) => submitActivity(slug, prev, formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal</label>
        <input name="date" type="date" required max={today} defaultValue={today} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Kegiatan</label>
        <input name="title" required maxLength={150} placeholder="mis. Kunjungan ke toko A" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Catatan (opsional)</label>
        <textarea name="description" rows={2} maxLength={500} className={inputClass} />
      </div>
      <FormMessages state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan Kegiatan"}
      </button>
    </form>
  );
}

export function TaskStatusSelect({
  slug,
  taskId,
  status,
}: {
  slug: string;
  taskId: string;
  status: "todo" | "in_progress" | "done";
}) {
  return (
    <select
      aria-label="Ubah status tugas"
      value={status}
      onChange={(e) => updateTaskStatus(slug, taskId, e.target.value as "todo" | "in_progress" | "done")}
      className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs"
    >
      <option value="todo">Belum mulai</option>
      <option value="in_progress">Dikerjakan</option>
      <option value="done">Selesai</option>
    </select>
  );
}
