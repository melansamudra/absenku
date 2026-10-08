"use client";

import Link from "next/link";
import { useState } from "react";
import {
  createEmployee,
  setEmployeeActive,
  softDeleteEmployee,
  updateEmployee,
  type ActionState,
} from "./actions";
import EmployeeForm, { type EmployeeFormValues } from "./employee-form";
import ImportEmployeesModal from "./import-employees-modal";

export type EmployeeRow = {
  id: string;
  name: string;
  salary_type: "harian" | "bulanan";
  daily_rate: number;
  monthly_rate: number;
  active: boolean;
  note: string | null;
  email: string | null;
  contract_end: string | null;
  daily_meal_allowance: number;
  daily_attendance_allowance: number;
  lembur_rate_per_hour: number | null;
  ptkp_status: string;
  has_pin: boolean;
};

function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

export default function EmployeesClient({
  businessId,
  employees,
}: {
  businessId: string;
  employees: EmployeeRow[];
}) {
  const [modal, setModal] = useState<"create" | EmployeeRow | null>(null);
  const [showImport, setShowImport] = useState(false);

  const boundCreate = (prevState: ActionState, formData: FormData) =>
    createEmployee(businessId, prevState, formData);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Karyawan</h1>
          <p className="mt-0.5 text-sm text-zinc-500">{employees.length} karyawan terdaftar</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/business/${businessId}/employees/tunjangan-tetap`}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Tunjangan Tetap
          </Link>
          <button
            type="button"
            onClick={() => setShowImport(true)}
            className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
          >
            Import CSV
          </button>
          <button
            type="button"
            onClick={() => setModal("create")}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            + Tambah Karyawan
          </button>
        </div>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Belum ada karyawan. Tambahkan yang pertama.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {employees.map((e) => (
              <div
                key={e.id}
                className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900">{e.name}</p>
                    {!e.active && (
                      <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                        Nonaktif
                      </span>
                    )}
                    {e.has_pin && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                        PIN
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {e.note ? `${e.note} · ` : ""}
                    {e.salary_type === "harian"
                      ? `${fmtRupiah(e.daily_rate)}/hari`
                      : `${fmtRupiah(e.monthly_rate)}/bulan`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setModal(e)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setEmployeeActive(businessId, e.id, !e.active)}
                    className="rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
                  >
                    {e.active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`Hapus ${e.name} dari daftar karyawan?`)) {
                        softDeleteEmployee(businessId, e.id);
                      }
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-lg font-bold text-zinc-900">
              {modal === "create" ? "Tambah Karyawan" : `Edit ${modal.name}`}
            </h2>
            {modal === "create" ? (
              <EmployeeForm
                action={boundCreate}
                submitLabel="Tambah Karyawan"
                onDone={() => setModal(null)}
              />
            ) : (
              <EmployeeForm
                action={(prevState: ActionState, formData: FormData) =>
                  updateEmployee(businessId, modal.id, prevState, formData)
                }
                initial={modal satisfies EmployeeFormValues}
                submitLabel="Simpan Perubahan"
                onDone={() => setModal(null)}
              />
            )}
          </div>
        </div>
      )}

      {showImport && (
        <ImportEmployeesModal businessId={businessId} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
