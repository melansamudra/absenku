"use client";

import { useActionState, useState } from "react";
import {
  approveReimbursement,
  rejectReimbursement,
  type ReimbursementActionState,
} from "./actions";

const initialState: ReimbursementActionState = { error: null };

export type PendingReimbursement = {
  id: string;
  employeeName: string;
  date: string;
  categoryLabel: string;
  amount: number;
  description: string | null;
};

export default function ReimbursementRow({
  businessId,
  claim,
}: {
  businessId: string;
  claim: PendingReimbursement;
}) {
  const [rejecting, setRejecting] = useState(false);
  const [approveState, approveAction, approving] = useActionState(
    (prev: ReimbursementActionState, formData: FormData) =>
      approveReimbursement(businessId, claim.id, prev, formData),
    initialState,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    (prev: ReimbursementActionState, formData: FormData) =>
      rejectReimbursement(businessId, claim.id, prev, formData),
    initialState,
  );
  const error = approveState.error ?? rejectState.error;

  return (
    <div className="px-5 py-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-zinc-900">{claim.employeeName}</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {claim.date} · {claim.categoryLabel}
            {claim.description ? ` · ${claim.description}` : ""}
          </p>
        </div>
        {!rejecting ? (
          <div className="flex shrink-0 items-center gap-2">
            <form action={approveAction} className="flex items-center gap-2">
              <input
                name="amount"
                type="number"
                min={1}
                step={1}
                defaultValue={claim.amount}
                aria-label="Nominal disetujui (Rp)"
                className="w-28 rounded-lg border border-zinc-200 px-2 py-1.5 text-xs"
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
