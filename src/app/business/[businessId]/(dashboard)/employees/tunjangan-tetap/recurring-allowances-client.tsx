"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import {
  createRecurringAllowance,
  deleteRecurringAllowance,
  toggleRecurringAllowanceActive,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export type RecurringAllowance = {
  id: string;
  label: string;
  amount: number;
  active: boolean;
};

export type EmployeeWithAllowances = {
  id: string;
  name: string;
  allowances: RecurringAllowance[];
};

function AddAllowanceForm({
  businessId,
  employeeId,
  onDone,
}: {
  businessId: string;
  employeeId: string;
  onDone: () => void;
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createRecurringAllowance(businessId, employeeId, prevState, formData);
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
      className="mt-2 flex flex-wrap items-end gap-2 rounded-lg bg-zinc-50 p-3"
    >
      <input
        name="label"
        placeholder="mis. Tunjangan Transport"
        className="flex-1 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
      />
      <input
        name="amount"
        type="number"
        min={0}
        step={1000}
        placeholder="Nominal (Rp)"
        className="w-36 rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Tambah"}
      </button>
      {state.error && <p className="w-full text-xs text-red-600">{state.error}</p>}
    </form>
  );
}

export default function RecurringAllowancesClient({
  businessId,
  employees,
}: {
  businessId: string;
  employees: EmployeeWithAllowances[];
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Tunjangan Tetap</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Tunjangan berulang yang otomatis ditambahkan ke setiap slip gaji baru yang dibuat untuk
          karyawan itu.
        </p>
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
                  <p className="font-semibold text-zinc-900">{e.name}</p>
                  <button
                    type="button"
                    onClick={() => setOpenId(openId === e.id ? null : e.id)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    {openId === e.id ? "Tutup" : "+ Tunjangan"}
                  </button>
                </div>

                {e.allowances.length > 0 && (
                  <div className="mt-2 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
                    {e.allowances.map((a) => (
                      <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className={a.active ? "text-zinc-700" : "text-zinc-400 line-through"}>
                          {a.label}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-medium text-zinc-900">{fmtRupiah(a.amount)}</span>
                          <button
                            type="button"
                            onClick={() =>
                              toggleRecurringAllowanceActive(businessId, a.id, !a.active)
                            }
                            className="text-xs text-zinc-500 hover:underline"
                          >
                            {a.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRecurringAllowance(businessId, a.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {openId === e.id && (
                  <AddAllowanceForm
                    businessId={businessId}
                    employeeId={e.id}
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
