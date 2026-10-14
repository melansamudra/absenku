"use client";

import { useState, useTransition } from "react";
import { generateBulkPins } from "./actions";

export default function BulkPinModal({ businessId, onClose }: { businessId: string; onClose: () => void }) {
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<{ employeeId: string; name: string; pin: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function run() {
    setError(null);
    startTransition(async () => {
      const r = await generateBulkPins(businessId);
      if (r.error) setError(r.error);
      else setResult(r.created);
    });
  }

  function copyAll() {
    if (!result) return;
    const text = result.map((r) => `${r.name}: ${r.pin}`).join("\n");
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="mb-1 text-lg font-bold text-zinc-900">Buat PIN untuk Semua</h2>

        {result === null && (
          <>
            <p className="mb-4 text-sm text-zinc-500">
              Membuat PIN absen 4 digit acak untuk setiap karyawan aktif yang belum punya PIN. Karyawan
              yang sudah punya PIN tidak akan diubah.
            </p>
            {error && <p className="mb-3 text-xs text-red-600">{error}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={run}
                disabled={pending}
                className="flex-1 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
              >
                {pending ? "Membuat…" : "Buat PIN"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                Batal
              </button>
            </div>
          </>
        )}

        {result !== null && (
          <>
            {result.length === 0 ? (
              <p className="mb-4 text-sm text-zinc-500">
                Semua karyawan aktif sudah punya PIN — tidak ada yang dibuat.
              </p>
            ) : (
              <>
                <p className="mb-3 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  PIN ini cuma ditampilkan sekali di sini — catat atau bagikan sekarang. Karyawan bisa
                  menggantinya sendiri nanti lewat Portal Karyawan.
                </p>
                <div className="mb-4 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
                  {result.map((r) => (
                    <div key={r.employeeId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                      <span className="text-zinc-700">{r.name}</span>
                      <span className="font-mono font-bold tracking-widest text-zinc-900">{r.pin}</span>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={copyAll}
                  className="mb-2 w-full rounded-lg border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
                >
                  {copied ? "Tersalin!" : "Salin Semua"}
                </button>
              </>
            )}
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              Selesai
            </button>
          </>
        )}
      </div>
    </div>
  );
}
