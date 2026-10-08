"use client";

import { useActionState, useState } from "react";
import {
  approveOvertimeRequest,
  rejectOvertimeRequest,
  type OvertimeActionState,
} from "./actions";

const initialState: OvertimeActionState = { error: null };

export type PendingOvertime = {
  id: string;
  employeeName: string;
  date: string;
  hours: number;
  reason: string | null;
};

export default function OvertimeRequestRow({
  businessId,
  request,
}: {
  businessId: string;
  request: PendingOvertime;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [approveState, approveAction, approving] = useActionState(
    (prev: OvertimeActionState, formData: FormData) =>
      approveOvertimeRequest(businessId, request.id, prev, formData),
    initialState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    (prev: OvertimeActionState, formData: FormData) =>
      rejectOvertimeRequest(businessId, request.id, prev, formData),
    initialState,
  );
  const error = approveState.error ?? rejectState.error;

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900">{request.employeeName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {request.date} · diajukan {request.hours} jam
            {request.reason ? ` · ${request.reason}` : ""}
          </p>
        </div>
        {!rejecting ? (
          <div className="flex shrink-0 items-center gap-2">
            <form action={approveAction} className="flex items-center gap-2">
              <input
                name="hours"
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                defaultValue={request.hours}
                aria-label="Jam lembur disetujui"
                className="w-20 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs"
              />
              <button
                type="submit"
                disabled={approving}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
              >
                {approving ? "…" : "Setujui"}
              </button>
            </form>
            <button
              type="button"
              onClick={() => setRejecting(true)}
              className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
            >
              Tolak
            </button>
          </div>
        ) : (
          <form action={rejectAction} className="flex shrink-0 items-center gap-2">
            <input
              name="note"
              maxLength={300}
              placeholder="Alasan (opsional)"
              className="w-44 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs"
            />
            <button
              type="submit"
              disabled={rejectPending}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
            >
              {rejectPending ? "…" : "Tolak"}
            </button>
            <button
              type="button"
              onClick={() => setRejecting(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800"
            >
              Batal
            </button>
          </form>
        )}
      </div>
      {error && <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
