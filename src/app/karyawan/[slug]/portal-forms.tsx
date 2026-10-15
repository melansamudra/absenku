"use client";

import { useActionState } from "react";
import { REIMBURSEMENT_CATEGORIES } from "@/lib/reimbursement/categories";
import {
  submitActivity,
  submitOvertimeRequest,
  submitReimbursement,
  updateTaskStatus,
  type PortalActionState,
} from "./actions";

const initialState: PortalActionState = { error: null };

const fieldClass =
  "w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-zinc-700 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-portal-300";

export function OvertimeRequestForm({ slug, today }: { slug: string; today: string }) {
  const [state, formAction, pending] = useActionState(
    (prev: PortalActionState, formData: FormData) => submitOvertimeRequest(slug, prev, formData),
    initialState,
  );

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block font-medium text-zinc-700">Tanggal</label>
          <input name="date" type="date" required max={today} defaultValue={today} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block font-medium text-zinc-700">Jam Lembur</label>
          <input
            name="hours"
            type="number"
            required
            min={0.5}
            max={12}
            step={0.5}
            placeholder="mis. 2"
            className={fieldClass}
          />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Keterangan (opsional)</label>
        <input name="reason" maxLength={300} placeholder="mis. stok opname" className={fieldClass} />
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
        className="w-full rounded-2xl bg-portal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Ajukan"}
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
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1.5 block font-medium text-zinc-700">Tanggal</label>
          <input name="date" type="date" required max={today} defaultValue={today} className={fieldClass} />
        </div>
        <div>
          <label className="mb-1.5 block font-medium text-zinc-700">Kategori</label>
          <select name="category" defaultValue="transport" className={fieldClass}>
            {Object.entries(REIMBURSEMENT_CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Nominal (Rp)</label>
        <input
          name="amount"
          type="number"
          inputMode="numeric"
          required
          min={1}
          max={50000000}
          step={1}
          placeholder="mis. 50000"
          className={fieldClass}
        />
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Keterangan</label>
        <input name="description" required maxLength={300} placeholder="mis. bensin ke klien" className={fieldClass} />
      </div>
      <FormMessages state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-portal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Mengirim…" : "Ajukan"}
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
    <form action={formAction} className="space-y-4">
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Tanggal</label>
        <input name="date" type="date" required max={today} defaultValue={today} className={fieldClass} />
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Kegiatan</label>
        <input name="title" required maxLength={150} placeholder="mis. Kunjungan ke toko A" className={fieldClass} />
      </div>
      <div>
        <label className="mb-1.5 block font-medium text-zinc-700">Catatan (opsional)</label>
        <textarea name="description" rows={2} maxLength={500} className={fieldClass} />
      </div>
      <FormMessages state={state} />
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-portal-500 py-3.5 text-sm font-semibold text-white disabled:opacity-60"
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
