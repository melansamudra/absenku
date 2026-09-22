"use client";

import { useActionState } from "react";
import { submitLeaveRequest, type ActionState } from "./actions";

const initialState: ActionState = { error: null, success: false };

export default function CutiForm({
  slug,
  businessName,
  employees,
  leaveTypes,
}: {
  slug: string;
  businessName: string;
  employees: { id: string; name: string }[];
  leaveTypes: { id: string; name: string }[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    submitLeaveRequest(slug, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (state.success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-bold text-zinc-900">Pengajuan Terkirim</h1>
          <p className="mt-2 text-sm text-zinc-500">
            Pengajuan cuti kamu sudah dikirim, tunggu persetujuan dari admin.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg font-bold text-white">
            A
          </div>
          <h1 className="text-lg font-bold text-zinc-900">{businessName}</h1>
          <p className="mt-0.5 text-xs text-zinc-500">Pengajuan Cuti</p>
        </div>

        <form action={formAction} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Pilih Nama Kamu</label>
            <select
              name="employee_id"
              defaultValue=""
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="" disabled>
                — Pilih nama —
              </option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Jenis Cuti</label>
            <select
              name="leave_type_id"
              defaultValue=""
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            >
              <option value="" disabled>
                — Pilih jenis cuti —
              </option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Mulai</label>
              <input
                name="start_date"
                type="date"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Selesai</label>
              <input
                name="end_date"
                type="date"
                className="w-full rounded-xl border border-zinc-200 px-3 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Alasan (opsional)</label>
            <textarea
              name="reason"
              rows={2}
              className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Mengirim…" : "Ajukan Cuti"}
          </button>
        </form>
      </div>
    </div>
  );
}
