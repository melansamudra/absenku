"use client";

import { useActionState, useEffect, useRef } from "react";
import { createLateTier, deleteLateTier, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export type LateTier = { id: string; threshold_minutes: number; amount: number };

export default function LateTiersClient({
  businessId,
  tiers,
}: {
  businessId: string;
  tiers: LateTier[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createLateTier(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  const sorted = [...tiers].sort((a, b) => a.threshold_minutes - b.threshold_minutes);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Potongan Telat Bertingkat</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Opsional — kalau diisi, potongan telat per hari dihitung dari tier tertinggi yang
          ambang menitnya terlampaui. Kalau kosong, payroll pakai potongan telat flat per
          kejadian yang diatur di halaman Pengaturan.
        </p>
      </div>

      {sorted.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {sorted.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-zinc-800">
                  Telat ≥ {t.threshold_minutes} menit
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-zinc-900">{fmtRupiah(t.amount)}</span>
                  <button
                    type="button"
                    onClick={() => deleteLateTier(businessId, t.id)}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Tambah Tier</h2>
        <form
          ref={formRef}
          action={(formData) => {
            hasSubmitted.current = true;
            formAction(formData);
          }}
          className="grid grid-cols-[1fr_1fr_auto] gap-2"
        >
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Ambang (menit)</label>
            <input
              name="threshold_minutes"
              type="number"
              min={0}
              step={1}
              placeholder="mis. 30"
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Potongan (Rp)</label>
            <input
              name="amount"
              type="number"
              min={0}
              step={1000}
              placeholder="mis. 25000"
              className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={pending}
            className="self-end rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "…" : "+ Tambah"}
          </button>
        </form>
        {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      </div>
    </div>
  );
}
