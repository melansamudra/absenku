"use client";

import { useTransition } from "react";
import { Download, ImageIcon } from "lucide-react";
import { btnOutline } from "@/components/form-ui";
import { setAttendanceLate, setAttendanceStatus, setAttendanceVerified, type AttendanceStatus } from "./actions";

export type AttendanceRowData = {
  employeeId: string;
  employeeName: string;
  employeeCode: string | null;
  position: string | null;
  organization: string | null;
  shift: string;
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

const STATUS_META: Record<AttendanceStatus, { label: string; badge: string }> = {
  hadir: { label: "Hadir", badge: "bg-emerald-50 text-emerald-700" },
  izin: { label: "Izin", badge: "bg-amber-50 text-amber-700" },
  sakit: { label: "Sakit", badge: "bg-sky-50 text-sky-700" },
  alpa: { label: "Alpa", badge: "bg-red-50 text-red-600" },
  off: { label: "Off", badge: "bg-zinc-100 text-zinc-500" },
};

function fmtTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" });
}

function csvCell(v: string | number) {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function exportCsv(date: string, rows: AttendanceRowData[]) {
  const header = ["Nama", "ID Karyawan", "Organisasi", "Jabatan", "Shift", "Status", "Masuk", "Keluar", "Terlambat (menit)", "Lembur (jam)", "Catatan"];
  const lines = rows.map((r) =>
    [
      r.employeeName,
      r.employeeCode ?? "",
      r.organization ?? "",
      r.position ?? "",
      r.shift,
      r.status ? STATUS_META[r.status].label : "Belum ada",
      fmtTime(r.checkInAt).replace("—", ""),
      fmtTime(r.checkOutAt).replace("—", ""),
      r.late ? r.lateMinutes : 0,
      r.overtimeHours,
      r.note ?? "",
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `presensi-${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function ExportButton({ date, rows }: { date: string; rows: AttendanceRowData[] }) {
  return (
    <button type="button" onClick={() => exportCsv(date, rows)} className={btnOutline}>
      <Download size={14} /> Ekspor
    </button>
  );
}

function Row({ businessId, date, index, row }: { businessId: string; date: string; index: number; row: AttendanceRowData }) {
  const [pending, startTransition] = useTransition();
  const meta = row.status ? STATUS_META[row.status] : null;

  return (
    <tr className={`hover:bg-zinc-50/60 ${pending ? "opacity-60" : ""}`}>
      <td className="px-5 py-3 text-zinc-500">{index}</td>
      <td className="px-3 py-3">
        <p className="font-medium text-zinc-900">{row.employeeName}</p>
        <p className="text-xs text-zinc-400">{[row.employeeCode, row.position].filter(Boolean).join(" · ")}</p>
      </td>
      <td className="px-3 py-3 text-zinc-600">{row.shift}</td>
      <td className="px-3 py-3">
        <select
          value={row.status ?? ""}
          disabled={pending}
          onChange={(e) => {
            const v = e.target.value as AttendanceStatus;
            if (v) startTransition(() => setAttendanceStatus(businessId, row.employeeId, date, v, row.note));
          }}
          className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-200 ${
            meta ? meta.badge : "bg-zinc-100 text-zinc-500"
          }`}
        >
          <option value="">Belum ada</option>
          {(Object.keys(STATUS_META) as AttendanceStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_META[s].label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-3 text-zinc-700">{fmtTime(row.checkInAt)}</td>
      <td className="px-3 py-3 text-zinc-700">{fmtTime(row.checkOutAt)}</td>
      <td className="px-3 py-3">
        {row.late && row.lateMinutes > 0 ? (
          <span className="text-xs font-semibold text-orange-600">{row.lateMinutes} mnt</span>
        ) : row.status === "hadir" ? (
          <button
            type="button"
            disabled={pending || !row.attendanceId}
            onClick={() => row.attendanceId && startTransition(() => setAttendanceLate(businessId, row.attendanceId!, !row.late))}
            className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${row.late ? "bg-orange-500 text-white" : "bg-zinc-100 text-zinc-400 hover:bg-zinc-200"}`}
          >
            Tandai telat
          </button>
        ) : (
          <span className="text-zinc-300">—</span>
        )}
      </td>
      <td className="px-3 py-3 text-zinc-700">
        {row.overtimeHours > 0 ? <span className="text-xs font-semibold text-brand-700">{row.overtimeHours.toLocaleString("id-ID")} jam</span> : <span className="text-zinc-300">—</span>}
      </td>
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          {row.checkInPhotoUrl && (
            <a href={row.checkInPhotoUrl} target="_blank" rel="noopener noreferrer" className="text-brand-700 hover:text-brand-900" aria-label="Lihat selfie" title="Lihat selfie">
              <ImageIcon size={15} />
            </a>
          )}
          {row.checkInAt && (
            <button
              type="button"
              disabled={pending || !row.attendanceId}
              onClick={() => row.attendanceId && startTransition(() => setAttendanceVerified(businessId, row.attendanceId!, !row.verifiedByAdmin))}
              className={`rounded-full px-2 py-0.5 text-[12px] font-semibold ${row.verifiedByAdmin ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
            >
              {row.verifiedByAdmin ? "✓ Terverifikasi" : "Verifikasi"}
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function AttendanceTable({
  businessId,
  date,
  rows,
}: {
  businessId: string;
  date: string;
  rows: AttendanceRowData[];
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[860px] text-left text-[14px]">
        <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
          <tr>
            <th className="w-12 px-5 py-3">No.</th>
            <th className="px-3 py-3">Nama</th>
            <th className="px-3 py-3">Shift</th>
            <th className="px-3 py-3">Status</th>
            <th className="px-3 py-3">Masuk</th>
            <th className="px-3 py-3">Keluar</th>
            <th className="px-3 py-3">Terlambat</th>
            <th className="px-3 py-3">Lembur</th>
            <th className="px-3 py-3">Verifikasi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {rows.length === 0 && (
            <tr>
              <td colSpan={9} className="py-14 text-center text-sm text-zinc-400">
                Belum ada karyawan aktif.
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <Row key={r.employeeId} businessId={businessId} date={date} index={i + 1} row={r} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
