"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
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
  employeeName: string;
  leaveTypeName: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string | null;
  status: "pending" | "approved" | "rejected";
};

function RequestRow({ businessId, request }: { businessId: string; request: LeaveRequestRow }) {
  const [pending, startTransition] = useTransition();
  const status = STATUS_LABEL[request.status];

  return (
    <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-semibold text-zinc-900">{request.employeeName}</p>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${status.className}`}>
            {status.label}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-zinc-500">
          {request.leaveTypeName} · {request.startDate} — {request.endDate} ({request.daysCount} hari)
        </p>
        {request.reason && (
          <p className="mt-0.5 text-xs text-zinc-400">&ldquo;{request.reason}&rdquo;</p>
        )}
      </div>
      {request.status === "pending" && (
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => approveLeaveRequest(businessId, request.id))}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            Setujui
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => rejectLeaveRequest(businessId, request.id, null))}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Tolak
          </button>
        </div>
      )}
    </div>
  );
}

function CreateLeaveRequestForm({
  businessId,
  employees,
  leaveTypes,
}: {
  businessId: string;
  employees: { id: string; name: string }[];
  leaveTypes: { id: string; name: string }[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createLeaveRequestByAdmin(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-800">+ Ajukan Cuti (oleh admin)</h2>
      <form
        ref={formRef}
        action={(formData) => {
          hasSubmitted.current = true;
          formAction(formData);
        }}
        className="space-y-3"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Karyawan</label>
            <select
              name="employee_id"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Pilih karyawan
              </option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Jenis Cuti</label>
            <select
              name="leave_type_id"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
              defaultValue=""
            >
              <option value="" disabled>
                Pilih jenis cuti
              </option>
              {leaveTypes.map((lt) => (
                <option key={lt.id} value={lt.id}>
                  {lt.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal Mulai</label>
            <input
              name="start_date"
              type="date"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal Selesai</label>
            <input
              name="end_date"
              type="date"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Alasan (opsional)</label>
          <input
            name="reason"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm"
          />
        </div>
        {state.error && <p className="text-xs text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Ajukan & Setujui"}
        </button>
      </form>
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
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">Pengajuan Cuti</h1>
        <p className="mt-0.5 text-sm text-zinc-500">
          Setujui/tolak pengajuan dari karyawan, atau ajukan langsung untuk karyawan.
        </p>
      </div>

      <div className="mb-5">
        <CreateLeaveRequestForm businessId={businessId} employees={employees} leaveTypes={leaveTypes} />
      </div>

      <div className="mb-3 flex gap-1.5">
        {(["pending", "approved", "rejected", "all"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              filter === f ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-600"
            }`}
          >
            {f === "all" ? "Semua" : STATUS_LABEL[f].label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-zinc-300 bg-white py-16 text-center">
          <p className="text-sm text-zinc-500">Tidak ada pengajuan.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="divide-y divide-zinc-100">
            {filtered.map((r) => (
              <RequestRow key={r.id} businessId={businessId} request={r} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
