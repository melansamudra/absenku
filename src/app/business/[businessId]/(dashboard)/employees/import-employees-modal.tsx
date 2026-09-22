"use client";

import { useActionState, useRef } from "react";
import { importEmployeesCsv, type ImportState } from "./import-actions";

const initialState: ImportState = { error: null, importedCount: 0, rowErrors: [] };

const TEMPLATE_CSV =
  "nama,tipe_gaji,gaji_harian,gaji_bulanan,divisi,email\n" +
  "Budi Santoso,harian,100000,,Kasir,budi@email.com\n" +
  "Siti Aminah,bulanan,,3000000,Admin,\n";

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "template-import-karyawan.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportEmployeesModal({
  businessId,
  onClose,
}: {
  businessId: string;
  onClose: () => void;
}) {
  const boundAction = (prevState: ImportState, formData: FormData) =>
    importEmployeesCsv(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-zinc-900">Import Karyawan (CSV)</h2>
        <p className="mb-4 text-xs text-zinc-500">
          Header wajib: <code>nama</code>. Opsional: <code>tipe_gaji</code> (harian/bulanan,
          default harian), <code>gaji_harian</code>, <code>gaji_bulanan</code>,{" "}
          <code>divisi</code>, <code>email</code>.
        </p>

        <button
          type="button"
          onClick={downloadTemplate}
          className="mb-4 text-xs font-medium text-brand-600 hover:underline"
        >
          Unduh Template CSV
        </button>

        <form ref={formRef} action={formAction} className="space-y-3">
          <input
            name="file"
            type="file"
            accept=".csv,text/csv"
            required
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
          )}

          {state.importedCount > 0 && (
            <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">
              {state.importedCount} karyawan berhasil ditambahkan.
            </p>
          )}

          {state.rowErrors.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
              {state.rowErrors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
            >
              {state.importedCount > 0 ? "Tutup" : "Batal"}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "Mengimpor…" : "Import"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
