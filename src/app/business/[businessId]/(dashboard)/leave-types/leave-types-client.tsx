"use client";

import Link from "next/link";
import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { createLeaveType, toggleLeaveTypeActive, updateLeaveTypeCarryover, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type LeaveType = {
  id: string;
  name: string;
  default_days_per_year: number;
  max_carryover_days: number;
  paid: boolean;
  active: boolean;
};

function CarryoverEditor({ businessId, leaveType }: { businessId: string; leaveType: LeaveType }) {
  const [value, setValue] = useState(String(leaveType.max_carryover_days));
  const [pending, startTransition] = useTransition();

  function save() {
    const n = Number(value);
    if (!(n >= 0)) return;
    startTransition(() => updateLeaveTypeCarryover(businessId, leaveType.id, n));
  }

  return (
    <div className="flex items-center gap-1.5">
      <input
        type="number"
        min={0}
        step={0.5}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-16 rounded-lg border border-zinc-200 px-2 py-1 text-xs"
      />
      <span className="text-xs text-zinc-400">hr carry-over maks.</span>
      <button
        type="button"
        onClick={save}
        disabled={pending || Number(value) === leaveType.max_carryover_days}
        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
      >
        Simpan
      </button>
    </div>
  );
}

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
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Jenis Cuti</h1>
          <p className="mt-0.5 text-sm text-zinc-500">
            Kuota dihitung per tahun berjalan (tahun kalender), dipakai buat validasi sisa cuti di
            halaman Pengajuan Cuti. &ldquo;Carry-over maks.&rdquo; membatasi berapa hari sisa tahun
            lalu yang bisa dibawa ke tahun ini.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Link
            href={`/business/${businessId}/leave-requests/carryover`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Carry-over
          </Link>
          <Link
            href={`/business/${businessId}/leave-requests/cuti-bersama`}
            className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Cuti Bersama
          </Link>
        </div>
      </div>

      {leaveTypes.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {leaveTypes.map((lt) => (
              <div key={lt.id} className="flex flex-wrap items-center justify-between gap-2 px-5 py-3">
                <div>
                  <p className={lt.active ? "font-medium text-zinc-900" : "font-medium text-zinc-400 line-through"}>
                    {lt.name}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {lt.default_days_per_year} hari/tahun · {lt.paid ? "Berbayar" : "Tanpa bayar"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <CarryoverEditor businessId={businessId} leaveType={lt} />
                  <button
                    type="button"
                    onClick={() => toggleLeaveTypeActive(businessId, lt.id, !lt.active)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    {lt.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                </div>
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
          <div className="grid grid-cols-3 gap-3">
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
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-600">
                Carry-over maks. (hari)
              </label>
              <input
                name="max_carryover_days"
                type="number"
                min={0}
                step={0.5}
                defaultValue={0}
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
