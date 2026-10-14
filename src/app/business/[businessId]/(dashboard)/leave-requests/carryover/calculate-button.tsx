"use client";

import { useState, useTransition } from "react";
import { calculateCarryover } from "./actions";

export default function CalculateCarryoverButton({ businessId, targetYear }: { businessId: string; targetYear: number }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function run() {
    setMessage(null);
    startTransition(async () => {
      const r = await calculateCarryover(businessId, targetYear);
      if (r.error) setMessage({ ok: false, text: r.error });
      else setMessage({ ok: true, text: `Carry-over ${targetYear} dihitung untuk ${r.updated} kombinasi karyawan × jenis cuti.` });
    });
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menghitung…" : `Hitung Carry-over ke ${targetYear}`}
      </button>
      {message && <p className={`text-xs ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}
    </div>
  );
}
