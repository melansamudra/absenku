"use client";

import { useActionState, useEffect, useRef } from "react";
import { createShiftTemplate, deleteShiftTemplate, type ActionState } from "./actions";

const initialState: ActionState = { error: null };

export type ShiftTemplate = { id: string; name: string; start_time: string; end_time: string };

export default function ShiftTemplatesPanel({
  businessId,
  templates,
}: {
  businessId: string;
  templates: ShiftTemplate[];
}) {
  const boundAction = (prevState: ActionState, formData: FormData) =>
    createShiftTemplate(businessId, prevState, formData);
  const [state, formAction, pending] = useActionState(boundAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-zinc-800">Shift</h2>

      {templates.length > 0 && (
        <div className="mb-3 divide-y divide-zinc-100 rounded-lg border border-zinc-100">
          {templates.map((t) => (
            <div key={t.id} className="flex items-center justify-between px-3 py-2 text-sm">
              <span className="text-zinc-700">
                {t.name}{" "}
                <span className="text-zinc-400">
                  ({t.start_time.slice(0, 5)}–{t.end_time.slice(0, 5)})
                </span>
              </span>
              <button
                type="button"
                onClick={() => deleteShiftTemplate(businessId, t.id)}
                className="text-xs text-red-500 hover:underline"
              >
                Hapus
              </button>
            </div>
          ))}
        </div>
      )}

      <form
        ref={formRef}
        action={(formData) => {
          hasSubmitted.current = true;
          formAction(formData);
        }}
        className="grid grid-cols-[1fr_auto_auto_auto] gap-2"
      >
        <input
          name="name"
          placeholder="mis. Shift Pagi"
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
        />
        <input
          name="start_time"
          type="time"
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
        />
        <input
          name="end_time"
          type="time"
          className="rounded-lg border border-zinc-200 px-2.5 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {pending ? "…" : "+ Tambah"}
        </button>
      </form>
      {state.error && <p className="mt-2 text-xs text-red-600">{state.error}</p>}
    </div>
  );
}
