"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLeaveType, toggleLeaveTypeActive, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type LeaveType = {
  id: string;
  name: string;
  default_days_per_year: number;
  paid: boolean;
  active: boolean;
};

export default function LeaveTypesClient({
  businessId,
  leaveTypes,
}: {
  businessId: string;
  leaveTypes: LeaveType[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createLeaveType(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Jenis Cuti</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Kuota dihitung per tahun berjalan (tahun kalender), dipakai buat validasi sisa cuti di
          halaman Pengajuan Cuti.
        </p>
      </div>

      {leaveTypes.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className={lt.active ? "font-medium text-zinc-900" : "font-medium text-zinc-400 line-through"}>
                    {lt.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {lt.default_days_per_year} hari/tahun · {lt.paid ? "Berbayar" : "Tanpa bayar"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleLeaveTypeActive(businessId, lt.id, !lt.active)}
                  className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  {lt.active ? "Nonaktifkan" : "Aktifkan"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Tambah Jenis Cuti</h2>
        <form
          ref={formRef}
          action={(formData) => {
            hasSubmitted.current = true;
            formAction(formData);
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">Nama</label>
              <input
                name="name"
                placeholder="mis. Cuti Tahunan"
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Kuota (hari/tahun)
              </label>
              <input
                name="default_days_per_year"
                type="number"
                min={0}
                step={0.5}
                defaultValue={12}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input type="checkbox" name="paid" defaultChecked className="rounded" />
            Berbayar (dibayar penuh saat disetujui)
          </label>
          {state.error && <p className="text-xs text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Menyimpan…" : "Tambah Jenis Cuti"}
          </button>
        </form>
      </div>
    </div>
  );
}
