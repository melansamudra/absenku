"use client";

import { useActionState } from "react";
import { createAdhocPayslip, type CreateAdhocPayslipState } from "./actions";

const initialState: CreateAdhocPayslipState = { error: null };

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}

export default function AdhocPayslipForm({
  businessId,
  employees,
}: {
  businessId: string;
  employees: { id: string; name: string }[];
}) {
  const boundAction = (prevState: CreateAdhocPayslipState, formData: FormData) =>
    createAdhocPayslip(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  if (employees.length === 0) {
    return <p className="py-10 text-center text-sm text-zinc-400">Belum ada karyawan aktif.</p>;
  }

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Karyawan</label>
        <select name="employee_id" defaultValue="" required className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm">
          <option value="" disabled>
            Pilih karyawan
          </option>
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Dari tanggal</label>
          <input name="period_start" type="date" defaultValue={today()} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Sampai tanggal</label>
          <input name="period_end" type="date" defaultValue={today()} className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Catatan (opsional)</label>
        <input
          name="note"
          placeholder="mis. Bonus proyek Agustus"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
        />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Membuat…" : "Buat Slip"}
      </button>
    </form>
  );
}
