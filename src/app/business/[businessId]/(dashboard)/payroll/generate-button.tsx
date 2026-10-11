"use client";

import { useState, useTransition } from "react";
import { Zap } from "lucide-react";
import { btnOutline } from "@/components/form-ui";
import { generatePayrollForMonth } from "./rekap/actions";

export default function GenerateButton({ businessId, month, label }: { businessId: string; month: string; label: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  function run() {
    if (
      !confirm(
        `Generate payroll ${label}?\n\nSlip dibuat untuk semua karyawan aktif yang belum punya slip di periode ini. Slip yang sudah ada tidak ditimpa.`,
      )
    )
      return;
    setMessage(null);
    startTransition(async () => {
      const r = await generatePayrollForMonth(businessId, month);
      if (r.errors.length > 0) {
        setMessage({ ok: false, text: `${r.created} slip dibuat, ${r.errors.length} gagal: ${r.errors.slice(0, 3).join("; ")}` });
      } else if (r.created === 0) {
        setMessage({ ok: true, text: r.skipped > 0 ? "Semua karyawan sudah punya slip di periode ini." : "Tidak ada karyawan aktif." });
      } else {
        setMessage({ ok: true, text: `${r.created} slip dibuat${r.skipped > 0 ? `, ${r.skipped} sudah ada` : ""}.` });
      }
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button type="button" onClick={run} disabled={pending} className={btnOutline}>
        <Zap size={14} /> {pending ? "Memproses…" : "Generate Payroll"}
      </button>
      {message && <p className={`max-w-xs text-right text-xs ${message.ok ? "text-emerald-600" : "text-red-600"}`}>{message.text}</p>}
    </div>
  );
}
