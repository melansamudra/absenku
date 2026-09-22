"use client";

import { useActionState, useState, useTransition } from "react";
import {
  addAdjustment,
  deleteAdjustment,
  markPayslipPaid,
  unmarkPayslipPaid,
  updateKasbonDeduction,
  updateLemburThr,
  updatePersonalLoanDeduction,
  updatePph21Amount,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export type Adjustment = { id: string; type: "tunjangan" | "potongan"; label: string; amount: number };

export default function PayslipDetailClient({
  businessId,
  payslipId,
  employeeId,
  isPaid,
  lemburAmount,
  thrAmount,
  kasbonDeduction,
  outstandingKasbon,
  personalLoanDeduction,
  outstandingPersonalLoan,
  pph21Amount,
  pph21Enabled,
  terCategory,
  adjustments,
  total,
}: {
  businessId: string;
  payslipId: string;
  employeeId: string;
  isPaid: boolean;
  lemburAmount: number;
  thrAmount: number;
  kasbonDeduction: number;
  outstandingKasbon: number;
  personalLoanDeduction: number;
  outstandingPersonalLoan: number;
  pph21Amount: number;
  pph21Enabled: boolean;
  terCategory: string | null;
  adjustments: Adjustment[];
  total: number;
}) {
  const [pending, startTransition] = useTransition();
  const [markError, setMarkError] = useState<string | null>(null);

  const boundAddAdjustment = (prevState: ActionState, formData: FormData) =>
    addAdjustment(businessId, payslipId, prevState, formData);
  const [adjState, adjFormAction, adjPending] = useActionState(boundAddAdjustment, initialState);

  const boundLemburThr = (prevState: ActionState, formData: FormData) =>
    updateLemburThr(businessId, payslipId, prevState, formData);
  const [lemburState, lemburFormAction, lemburPending] = useActionState(
    boundLemburThr,
    initialState,
  );

  const boundKasbon = (prevState: ActionState, formData: FormData) =>
    updateKasbonDeduction(businessId, payslipId, employeeId, prevState, formData);
  const [kasbonState, kasbonFormAction, kasbonPending] = useActionState(boundKasbon, initialState);

  const boundPersonalLoan = (prevState: ActionState, formData: FormData) =>
    updatePersonalLoanDeduction(businessId, payslipId, employeeId, prevState, formData);
  const [personalLoanState, personalLoanFormAction, personalLoanPending] = useActionState(
    boundPersonalLoan,
    initialState,
  );

  const boundPph21 = (prevState: ActionState, formData: FormData) =>
    updatePph21Amount(businessId, payslipId, prevState, formData);
  const [pph21State, pph21FormAction, pph21Pending] = useActionState(boundPph21, initialState);

  function handleMarkPaid() {
    setMarkError(null);
    startTransition(async () => {
      const result = await markPayslipPaid(businessId, payslipId);
      if (result?.error) setMarkError(result.error);
    });
  }

  function handleUnmarkPaid() {
    startTransition(() => {
      unmarkPayslipPaid(businessId, payslipId);
    });
  }

  return (
    <div className="space-y-5">
      {/* Lembur & THR */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Lembur &amp; THR</h2>
        <form action={lemburFormAction} className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Nominal Lembur</label>
            <input
              name="lembur_amount"
              type="number"
              min={0}
              step={1000}
              defaultValue={lemburAmount}
              disabled={isPaid}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">THR</label>
            <input
              name="thr_amount"
              type="number"
              min={0}
              step={1000}
              defaultValue={thrAmount}
              disabled={isPaid}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
            />
          </div>
          {lemburState.error && (
            <p className="col-span-2 text-xs text-red-600">{lemburState.error}</p>
          )}
          {!isPaid && (
            <button
              type="submit"
              disabled={lemburPending}
              className="col-span-2 rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {lemburPending ? "Menyimpan…" : "Simpan"}
            </button>
          )}
        </form>
      </div>

      {/* Kasbon */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Potongan Kasbon</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Sisa kasbon karyawan saat ini: {fmtRupiah(outstandingKasbon)}
        </p>
        <form action={kasbonFormAction} className="flex items-end gap-3">
          <div className="flex-1">
            <input
              name="kasbon_deduction"
              type="number"
              min={0}
              max={outstandingKasbon}
              step={1000}
              defaultValue={kasbonDeduction}
              disabled={isPaid}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
            />
          </div>
          {!isPaid && (
            <button
              type="submit"
              disabled={kasbonPending}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {kasbonPending ? "Menyimpan…" : "Simpan"}
            </button>
          )}
        </form>
        {kasbonState.error && <p className="mt-2 text-xs text-red-600">{kasbonState.error}</p>}
      </div>

      {/* Pinjaman Pribadi */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-1 text-sm font-semibold text-zinc-800">Potongan Pinjaman Pribadi</h2>
        <p className="mb-3 text-xs text-zinc-400">
          Sisa pinjaman karyawan saat ini: {fmtRupiah(outstandingPersonalLoan)}
        </p>
        <form action={personalLoanFormAction} className="flex items-end gap-3">
          <div className="flex-1">
            <input
              name="personal_loan_deduction"
              type="number"
              min={0}
              max={outstandingPersonalLoan}
              step={1000}
              defaultValue={personalLoanDeduction}
              disabled={isPaid}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
            />
          </div>
          {!isPaid && (
            <button
              type="submit"
              disabled={personalLoanPending}
              className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {personalLoanPending ? "Menyimpan…" : "Simpan"}
            </button>
          )}
        </form>
        {personalLoanState.error && (
          <p className="mt-2 text-xs text-red-600">{personalLoanState.error}</p>
        )}
      </div>

      {/* PPh 21 — cuma tampil kalau fitur aktif di Pengaturan, atau slip ini
          sudah kadung punya nominal (mis. dibuat sebelum fitur dimatikan). */}
      {(pph21Enabled || pph21Amount > 0) && (
        <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
          <h2 className="mb-1 text-sm font-semibold text-zinc-800">Potongan PPh 21</h2>
          <p className="mb-3 text-xs text-zinc-400">
            {terCategory
              ? `Dihitung otomatis pakai TER kategori ${terCategory} — nominal bisa dikoreksi manual.`
              : "Nominal manual — belum ada kategori TER tersimpan untuk slip ini."}
          </p>
          <form action={pph21FormAction} className="flex items-end gap-3">
            <div className="flex-1">
              <input
                name="pph21_amount"
                type="number"
                min={0}
                step={1000}
                defaultValue={pph21Amount}
                disabled={isPaid}
                className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm disabled:bg-zinc-100"
              />
            </div>
            {!isPaid && (
              <button
                type="submit"
                disabled={pph21Pending}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
              >
                {pph21Pending ? "Menyimpan…" : "Simpan"}
              </button>
            )}
          </form>
          {pph21State.error && <p className="mt-2 text-xs text-red-600">{pph21State.error}</p>}
        </div>
      )}

      {/* Adjustments */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Tunjangan &amp; Potongan Lain</h2>
        {adjustments.length > 0 && (
          <div className="mb-3 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
            {adjustments.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-zinc-600">
                  {a.label}{" "}
                  <span
                    className={`ml-1 text-[10px] font-semibold uppercase ${
                      a.type === "tunjangan" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {a.type}
                  </span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-zinc-900">
                    {a.type === "tunjangan" ? "+" : "-"}
                    {fmtRupiah(a.amount)}
                  </span>
                  {!isPaid && (
                    <button
                      type="button"
                      onClick={() => deleteAdjustment(businessId, payslipId, a.id)}
                      className="text-xs text-red-500 hover:underline"
                    >
                      Hapus
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        {!isPaid && (
          <form action={adjFormAction} className="grid grid-cols-[1fr_1fr_auto] gap-2">
            <select
              name="type"
              className="rounded-lg border border-zinc-200 px-2 py-2 text-sm"
              defaultValue="tunjangan"
            >
              <option value="tunjangan">Tunjangan</option>
              <option value="potongan">Potongan</option>
            </select>
            <input
              name="label"
              placeholder="Keterangan"
              className="rounded-lg border border-zinc-200 px-2 py-2 text-sm"
            />
            <input
              name="amount"
              type="number"
              min={0}
              step={1000}
              placeholder="Rp"
              className="w-28 rounded-lg border border-zinc-200 px-2 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={adjPending}
              className="col-span-3 rounded-lg border border-zinc-200 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
            >
              {adjPending ? "Menambah…" : "+ Tambah"}
            </button>
          </form>
        )}
        {adjState.error && <p className="mt-2 text-xs text-red-600">{adjState.error}</p>}
      </div>

      {/* Total & Mark paid */}
      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-zinc-800">Total Diterima</span>
          <span className="text-xl font-bold text-zinc-900">{fmtRupiah(total)}</span>
        </div>
        {markError && <p className="mb-3 text-xs text-red-600">{markError}</p>}
        {isPaid ? (
          <button
            type="button"
            onClick={handleUnmarkPaid}
            disabled={pending}
            className="w-full rounded-lg border border-zinc-200 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-60"
          >
            {pending ? "Memproses…" : "Batalkan Status Lunas"}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleMarkPaid}
            disabled={pending}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Memproses…" : "Tandai Lunas"}
          </button>
        )}
      </div>
    </div>
  );
}
