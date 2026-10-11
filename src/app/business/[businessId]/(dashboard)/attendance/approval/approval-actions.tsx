"use client";

import { useTransition } from "react";
import { Check, X } from "lucide-react";
import { rejectAttendance, setAttendanceVerified } from "../actions";

export default function ApprovalActions({
  businessId,
  attendanceId,
  state,
}: {
  businessId: string;
  attendanceId: string;
  state: "waiting" | "approved" | "rejected";
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center justify-end gap-1.5">
      {state !== "approved" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => startTransition(() => setAttendanceVerified(businessId, attendanceId, true))}
          className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
        >
          <Check size={13} /> Setujui
        </button>
      )}
      {state !== "rejected" && (
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            const note = window.prompt("Alasan penolakan (opsional). Presensi akan dicatat sebagai alpa.");
            if (note === null) return;
            startTransition(() => rejectAttendance(businessId, attendanceId, note));
          }}
          className="inline-flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
        >
          <X size={13} /> Tolak
        </button>
      )}
    </div>
  );
}
