"use client";

import { useTransition } from "react";
import {
  setAttendanceLate,
  setAttendanceStatus,
  setAttendanceVerified,
  type AttendanceStatus,
} from "./actions";

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; className: string }[] = [
  { value: "hadir", label: "Hadir", className: "bg-emerald-600" },
  { value: "izin", label: "Izin", className: "bg-amber-500" },
  { value: "sakit", label: "Sakit", className: "bg-sky-500" },
  { value: "alpa", label: "Alpa", className: "bg-red-500" },
  { value: "off", label: "Off", className: "bg-zinc-400" },
];

export type AttendanceRowData = {
  employeeId: string;
  employeeName: string;
  employeeNote: string | null;
  attendanceId: string | null;
  status: AttendanceStatus | null;
  note: string | null;
  late: boolean;
  lateMinutes: number;
  overtimeHours: number;
  checkInAt: string | null;
  checkOutAt: string | null;
  checkInPhotoUrl: string | null;
  verifiedByAdmin: boolean;
};

function fmtTime(iso: string | null) {
  if (!iso) return null;
  return new Date(iso).toLocaleTimeString("id-ID", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AttendanceRow({
  businessId,
  date,
  row,
}: {
  businessId: string;
  date: string;
  row: AttendanceRowData;
}) {
  const [pending, startTransition] = useTransition();

  function setStatus(status: AttendanceStatus) {
    startTransition(() => {
      setAttendanceStatus(businessId, row.employeeId, date, status, row.note);
    });
  }

  function toggleLate() {
    if (!row.attendanceId) return;
    startTransition(() => {
      setAttendanceLate(businessId, row.attendanceId!, !row.late);
    });
  }

  function toggleVerified() {
    if (!row.attendanceId) return;
    startTransition(() => {
      setAttendanceVerified(businessId, row.attendanceId!, !row.verifiedByAdmin);
    });
  }

  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 sm:w-48 sm:shrink-0">
        <p className="truncate font-medium text-zinc-900">{row.employeeName}</p>
        {row.employeeNote && <p className="text-xs text-zinc-400">{row.employeeNote}</p>}
        {(row.checkInAt || row.checkOutAt) && (
          <p className="mt-0.5 text-[11px] text-zinc-400">
            🤳 {fmtTime(row.checkInAt) ?? "—"} → {fmtTime(row.checkOutAt) ?? "—"}
            {row.late && row.lateMinutes > 0 && (
              <span className="font-semibold text-orange-600"> · telat {row.lateMinutes} mnt</span>
            )}
            {row.overtimeHours > 0 && (
              <span className="font-semibold text-brand-600">
                {" "}
                · lembur {row.overtimeHours.toLocaleString("id-ID")} jam
              </span>
            )}
            {row.checkInPhotoUrl && (
              <>
                {" · "}
                <a
                  href={row.checkInPhotoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-600 hover:underline"
                >
                  Lihat foto
                </a>
              </>
            )}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={pending}
            onClick={() => setStatus(opt.value)}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              row.status === opt.value
                ? `${opt.className} text-white`
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        {row.status === "hadir" && (
          <button
            type="button"
            disabled={pending || !row.attendanceId}
            onClick={toggleLate}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              row.late ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            Telat
          </button>
        )}
        {row.checkInAt && (
          <button
            type="button"
            disabled={pending || !row.attendanceId}
            onClick={toggleVerified}
            className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors disabled:opacity-50 ${
              row.verifiedByAdmin
                ? "bg-brand-600 text-white"
                : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
            }`}
          >
            {row.verifiedByAdmin ? "✓ Terverifikasi" : "Verifikasi"}
          </button>
        )}
      </div>
    </div>
  );
}
