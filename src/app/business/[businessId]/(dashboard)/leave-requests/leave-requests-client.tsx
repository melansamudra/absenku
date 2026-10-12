"use client";

import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Gauge, Plus, Search, Settings2, X } from "lucide-react";
import { Card, Field, PageHeader, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import {
  approveLeaveRequest,
  createLeaveRequestByAdmin,
  rejectLeaveRequest,
  type ActionState,
} from "./actions";

const initialState: ActionState = { error: null };

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  pending: { label: "Menunggu", className: "bg-amber-50 text-amber-700" },
  approved: { label: "Disetujui", className: "bg-emerald-50 text-emerald-700" },
  rejected: { label: "Ditolak", className: "bg-red-50 text-red-700" },
};

export type LeaveRequestRow = {
  id: string;
  leaveTypeId: string;
  employeeName: string;
  employeeCode: string | null;
  leaveTypeName: string;
  createdAt: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
};

function fmtDate(d: string) {
  const iso = d.length > 10 ? d : `${d}T00:00:00`;
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: d.length > 10 ? "Asia/Jakarta" : undefined });
}

function RequestRow({ businessId, index, request }: { businessId: string; index: number; request: LeaveRequestRow }) {
  const [pending, startTransition] = useTransition();
  const status = STATUS_LABEL[request.status];

  return (
    <tr className={`hover:bg-zinc-50/60 ${pending ? "opacity-60" : ""}`}>
      <td className="px-5 py-3 text-zinc-500">{index}</td>
      <td className="px-3 py-3">
        <p className="font-medium text-zinc-900">{request.employeeName}</p>
        <p className="text-xs text-zinc-400">{request.employeeCode ?? ""}</p>
      </td>
      <td className="px-3 py-3 text-zinc-700">{request.leaveTypeName}</td>
      <td className="px-3 py-3 text-zinc-600">{fmtDate(request.createdAt)}</td>
      <td className="px-3 py-3 text-zinc-700">{request.daysCount} hari</td>
      <td className="px-3 py-3 text-zinc-600">
        {fmtDate(request.startDate)}
        {request.endDate !== request.startDate && ` – ${fmtDate(request.endDate)}`}
        {request.reason && <p className="mt-0.5 text-xs text-zinc-400">&ldquo;{request.reason}&rdquo;</p>}
      </td>
      <td className="px-3 py-3">
        <span className={`rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${status.className}`}>{status.label}</span>
      </td>
      <td className="px-5 py-3">
        {request.status === "pending" && (
          <div className="flex justify-end gap-1.5">
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => approveLeaveRequest(businessId, request.id))}
              className="rounded-lg bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              Setujui
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={() => startTransition(() => rejectLeaveRequest(businessId, request.id, null))}
              className="rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              Tolak
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

function CreateLeaveRequestModal({
  businessId,
  employees,
  leaveTypes,
  defaultLeaveTypeId,
  onClose,
}: {
  businessId: string;
  employees: { id: string; name: string }[];
  leaveTypes: { id: string; name: string }[];
  defaultLeaveTypeId: string;
  onClose: () => void;
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createLeaveRequestByAdmin(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) onClose();
  }, [pending, state.error, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Tambah Pengajuan Cuti</h2>
            <p className="text-xs text-zinc-400">Diajukan oleh admin — langsung berstatus disetujui.</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100" aria-label="Tutup">
            <X size={18} />
          </button>
        </div>
        <form
          action={(formData) => {
            hasSubmitted.current = true;
            formAction(formData);
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Nama Karyawan" required>
              <select name="employee_id" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Pilih karyawan
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Jenis Cuti" required>
              <select name="leave_type_id" className={inputClass} defaultValue={defaultLeaveTypeId}>
                <option value="" disabled>
                  Pilih jenis cuti
                </option>
                {leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Tanggal Mulai" required>
              <input name="start_date" type="date" className={inputClass} />
            </Field>
            <Field label="Tanggal Selesai" required>
              <input name="end_date" type="date" className={inputClass} />
            </Field>
            <Field label="Keterangan" className="sm:col-span-2">
              <input name="reason" className={inputClass} placeholder="Alasan (opsional)" />
            </Field>
          </div>
          {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className={btnOutline}>
              Batal
            </button>
            <button type="submit" disabled={pending} className={btnPrimary}>
              {pending ? "Menyimpan…" : "Ajukan & Setujui"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeaveRequestsClient({
  businessId,
  requests,
  employees,
  leaveTypes,
}: {
  businessId: string;
  requests: LeaveRequestRow[];
  employees: { id: string; name: string }[];
  leaveTypes: { id: string; name: string }[];
}) {
  const base = `/business/${businessId}`;
  const [typeTab, setTypeTab] = useState<string>("all");
  const [status, setStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [query, setQuery] = useState("");
  const [creating, setCreating] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (typeTab !== "all" && r.leaveTypeId !== typeTab) return false;
      if (status !== "all" && r.status !== status) return false;
      if (q && !`${r.employeeName} ${r.employeeCode ?? ""} ${r.leaveTypeName}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [requests, typeTab, status, query]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  return (
    <div>
      <PageHeader
        title="Izin & Cuti"
        subtitle={pendingCount > 0 ? `${pendingCount} pengajuan menunggu persetujuan` : "Setujui atau tolak pengajuan dari karyawan."}
        actions={
          <>
            <Link href={`${base}/leave-requests/balance`} className={btnOutline}>
              <Gauge size={14} /> Lihat Sisa Cuti
            </Link>
            <Link href={`${base}/leave-types`} className={btnOutline}>
              <Settings2 size={14} /> Atur Kebijakan Cuti
            </Link>
            <button type="button" onClick={() => setCreating(true)} className={btnPrimary}>
              <Plus size={15} /> Tambah Pengajuan
            </button>
          </>
        }
      />

      <Card className="!p-0">
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-3">
          {[{ id: "all", name: "Semua" }, ...leaveTypes].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTypeTab(t.id)}
              className={`shrink-0 rounded-lg border px-4 py-1.5 text-[14px] ${
                typeTab === t.id
                  ? "border-brand-500 bg-white font-semibold text-brand-700"
                  : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-3">
          <div className="flex gap-1.5">
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatus(f)}
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  status === f ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                }`}
              >
                {f === "all" ? "Semua" : STATUS_LABEL[f].label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari"
              className={`${inputClass} !w-48 !pl-8`}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-[14px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Nama Karyawan</th>
                <th className="px-3 py-3">Jenis</th>
                <th className="px-3 py-3">Tgl. Pengajuan</th>
                <th className="px-3 py-3">Durasi Cuti</th>
                <th className="px-3 py-3">Periode Cuti</th>
                <th className="px-3 py-3">Status Persetujuan</th>
                <th className="px-5 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center text-sm text-zinc-400">
                    Tidak ada pengajuan. Karyawan bisa mengajukan cuti dari link Pengajuan Cuti atau Portal Karyawan.
                  </td>
                </tr>
              )}
              {filtered.map((r, i) => (
                <RequestRow key={r.id} businessId={businessId} index={i + 1} request={r} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && (
        <CreateLeaveRequestModal
          businessId={businessId}
          employees={employees}
          leaveTypes={leaveTypes}
          defaultLeaveTypeId={typeTab !== "all" ? typeTab : ""}
          onClose={() => setCreating(false)}
        />
      )}
    </div>
  );
}
