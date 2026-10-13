"use client";

import { useState, useTransition } from "react";
import { applyWeeklySchedule } from "../actions";
import { inputClass } from "@/components/form-ui";

function today() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
}
function endOfMonth() {
  const d = new Date();
  return new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0)).toISOString().slice(0, 10);
}

export default function ApplyScheduleForm({ businessId }: { businessId: string }) {
  const [startDate, setStartDate] = useState(today());
  const [endDate, setEndDate] = useState(endOfMonth());
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function run() {
    setMessage(null);
    startTransition(async () => {
      const r = await applyWeeklySchedule(businessId, startDate, endDate);
      if (r.error) setMessage({ ok: false, text: r.error });
      else setMessage({ ok: true, text: r.filled === 0 ? "Semua tanggal di rentang ini sudah punya jadwal." : `${r.filled} jadwal diisi.` });
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Dari tanggal</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Sampai tanggal</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputClass} />
      </div>
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Menerapkan…" : "Terapkan"}
      </button>
      {message && (
        <p className={`w-full text-xs ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
