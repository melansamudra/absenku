"use client";

import { useActionState, useEffect, useRef, useState } from "react";

// Komponen generik buat "ledger" sederhana per karyawan (nominal + tanggal +
// catatan, sisa dihitung on-read) — dipakai oleh kasbon dan pinjaman pribadi,
// dua fitur yang strukturnya identik tapi tabel & tujuannya beda.

export type LedgerActionState = { error: string | null };
export type LedgerEmployee = { id: string; name: string; outstanding: number };
export type LedgerAddAction = (
  businessId: string,
  employeeId: string,
  prevState: LedgerActionState,
  formData: FormData,
) => Promise<LedgerActionState>;

const initialState: LedgerActionState = { error: null };

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

function todayLocal() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

function AddLedgerEntryForm({
  businessId,
  employeeId,
  addAction,
  submitLabel,
  onDone,
}: {
  businessId: string;
  employeeId: string;
  addAction: LedgerAddAction;
  submitLabel: string;
  onDone: () => void;
}) {
  const boundAction = (prevState: LedgerActionState, formData: FormData) =>
    addAction(businessId, employeeId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) onDone();
  }, [pending, state.error, onDone]);

  return (
    <form
      action={(formData) => {
        hasSubmitted.current = true;
        formAction(formData);
      }}
      className="mt-3 space-y-2 rounded-lg bg-zinc-50 p-3"
    >
      <div className="grid grid-cols-2 gap-2">
        <input
          name="date"
          type="date"
          defaultValue={todayLocal()}
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
        />
        <input
          name="amount"
          type="number"
          min={0}
          step={1000}
          placeholder="Nominal (Rp)"
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
        />
      </div>
      <input
        name="note"
        placeholder="Catatan (opsional)"
        className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : submitLabel}
      </button>
    </form>
  );
}

export default function LedgerManager({
  businessId,
  employees,
  addAction,
  title,
  description,
  addButtonLabel = "+ Catat",
  submitLabel = "Simpan",
  outstandingLabel = "Sisa",
}: {
  businessId: string;
  employees: LedgerEmployee[];
  addAction: LedgerAddAction;
  title: string;
  description: string;
  addButtonLabel?: string;
  submitLabel?: string;
  outstandingLabel?: string;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">{title}</h1>
        <p className="mt-0.5 text-sm text-zinc-500">{description}</p>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan aktif.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {employees.map((e) => (
              <div key={e.id} className="px-5 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-zinc-900">{e.name}</p>
                    <p className="mt-0.5 text-xs text-zinc-400">
                      {outstandingLabel}: {fmtRupiah(e.outstanding)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === e.id ? null : e.id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    {openId === e.id ? "Tutup" : addButtonLabel}
                  </button>
                </div>
                {openId === e.id && (
                  <AddLedgerEntryForm
                    businessId={businessId}
                    employeeId={e.id}
                    addAction={addAction}
                    submitLabel={submitLabel}
                    onDone={() => setOpenId(null)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
