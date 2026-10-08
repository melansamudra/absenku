"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createPayslip, type CreatePayslipState } from "./actions";

const initialState: CreatePayslipState = { error: null };

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default function RekapRow({
  businessId,
  employeeId,
  employeeName,
  periodStart,
  periodEnd,
  defaultOvertimeHours,
  preview,
  existingPayslipId,
  recurringAllowanceCount,
  recurringAllowanceTotal,
  pph21Estimate,
  bpjsEstimate,
}: {
  businessId: string;
  employeeId: string;
  employeeName: string;
  periodStart: string;
  periodEnd: string;
  defaultOvertimeHours: number;
  preview: { hadir: number; izin: number; sakit: number; alpa: number; off: number; subtotal: number };
  existingPayslipId: string | null;
  recurringAllowanceCount: number;
  recurringAllowanceTotal: number;
  pph21Estimate: number;
  bpjsEstimate: number;
}) {
  const [open, setOpen] = useState(false);
  const boundAction = (prevState: CreatePayslipState, formData: FormData) =>
    createPayslip(businessId, employeeId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-zinc-900">{employeeName}</p>
          <p className="mt-0.5 text-xs text-zinc-400">
            Hadir {preview.hadir} · Izin {preview.izin} · Sakit {preview.sakit} · Alpa{" "}
            {preview.alpa} · Off {preview.off}
          </p>
          {recurringAllowanceCount > 0 && (
            <p className="mt-0.5 text-xs text-emerald-600">
              + {recurringAllowanceCount} tunjangan tetap aktif ({fmtRupiah(recurringAllowanceTotal)}
              ) — otomatis ditambahkan saat slip dibuat
            </p>
          )}
          {pph21Estimate > 0 && (
            <p className="mt-0.5 text-xs text-red-500">
              - Estimasi PPh 21: {fmtRupiah(pph21Estimate)} (sudah termasuk di total di samping)
            </p>
          )}
          {bpjsEstimate > 0 && (
            <p className="mt-0.5 text-xs text-red-500">
              - Estimasi BPJS bagian karyawan: {fmtRupiah(bpjsEstimate)} (sudah termasuk di total di samping)
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <p className="text-sm font-bold text-zinc-900">{fmtRupiah(preview.subtotal)}</p>
          {existingPayslipId ? (
            <Link
              href={`/business/${businessId}/payroll/${existingPayslipId}`}
              className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
            >
              Lihat Slip
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
            >
              {open ? "Tutup" : "Buat Slip"}
            </button>
          )}
        </div>
      </div>

      {open && !existingPayslipId && (
        <form action={formAction} className="mt-3 rounded-lg bg-zinc-50 p-3">
          <input type="hidden" name="period_start" value={periodStart} />
          <input type="hidden" name="period_end" value={periodEnd} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                Jam Lembur
              </label>
              <input
                name="lembur_hours"
                type="number"
                min={0}
                step={0.5}
                defaultValue={defaultOvertimeHours}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-[11px] font-medium text-zinc-500">
                THR (Rp)
              </label>
              <input
                name="thr_amount"
                type="number"
                min={0}
                step={1000}
                defaultValue={0}
                className="w-full rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm focus:border-brand-600 focus:outline-none"
              />
            </div>
          </div>
          {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="mt-3 w-full rounded-lg bg-brand-600 py-2 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "Membuat…" : "Konfirmasi Buat Slip"}
          </button>
        </form>
      )}
    </div>
  );
}
