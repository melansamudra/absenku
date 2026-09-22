"use client";

import { useActionState, useEffect, useRef } from "react";
import { createHoliday, deleteHoliday, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type Holiday = { id: string; holiday_date: string; label: string | null };

export default function HolidaysClient({
  businessId,
  holidays,
}: {
  businessId: string;
  holidays: Holiday[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createHoliday(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  const sorted = [...holidays].sort((a, b) => a.holiday_date.localeCompare(b.holiday_date));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Tanggal Merah Tambahan</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Tanggal libur nasional/cuti bersama di luar Sabtu-Minggu — izin tanpa keterangan yang
          jatuh di tanggal ini kena tarif potongan &ldquo;akhir pekan&rdquo; (diatur di halaman Pengaturan),
          bukan tarif hari kerja biasa.
        </p>
      </div>

      {sorted.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {sorted.map((h) => (
              <div key={h.id} className="flex items-center justify-between px-5 py-3">
                <p className="text-sm text-zinc-800">
                  {h.holiday_date}
                  {h.label && <span className="ml-2 text-zinc-400">— {h.label}</span>}
                </p>
                <button
                  type="button"
                  onClick={() => deleteHoliday(businessId, h.id)}
                  className="text-xs text-red-500 hover:underline"
                >
                  Hapus
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-zinc-800">Tambah Tanggal</h2>
        <form
          ref={formRef}
          action={(formData) => {
            hasSubmitted.current = true;
            formAction(formData);
          }}
          className="grid grid-cols-[auto_1fr_auto] gap-2"
        >
          <input
            name="holiday_date"
            type="date"
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
          />
          <input
            name="label"
            placeholder="mis. Cuti Bersama Lebaran (opsional)"
            className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            {pending ? "…" : "+ Tambah"}
          </button>
        </form>
        {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
      </div>
    </div>
  );
}
