"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCollectiveLeaveDay, deleteCollectiveLeaveDay, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type CollectiveLeaveDay = {
  id: string;
  date: string;
  label: string;
  leaveTypeId: string | null;
  leaveTypeName: string | null;
};

export default function CutiBersamaClient({
  businessId,
  days,
  leaveTypes,
}: {
  businessId: string;
  days: CollectiveLeaveDay[];
  leaveTypes: { id: string; name: string }[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    addCollectiveLeaveDay(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div>
      <form
        ref={formRef}
        action={(formData) => {
          hasSubmitted.current = true;
          formAction(formData);
        }}
        className="mb-5 space-y-3 border-b border-zinc-100 pb-5"
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal</label>
            <input name="date" type="date" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Nama/Keterangan</label>
            <input
              name="label"
              placeholder="mis. Cuti Bersama Lebaran"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Potong kuota jenis cuti</label>
            <select name="leave_type_id" defaultValue="" className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
              <option value="">Tidak memotong kuota</option>
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Tambah Cuti Bersama"}
        </button>
      </form>

      {days.length === 0 ? (
        <p className="py-10 text-center text-sm text-zinc-400">Belum ada cuti bersama yang diatur.</p>
      ) : (
        <div className="divide-y divide-zinc-100">
          {days.map((d) => (
            <div key={d.id} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium text-zinc-900">{d.label}</p>
                <p className="mt-0.5 text-xs text-zinc-400">
                  {d.date} · {d.leaveTypeName ? `memotong kuota ${d.leaveTypeName}` : "tidak memotong kuota"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => deleteCollectiveLeaveDay(businessId, d.id)}
                className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
