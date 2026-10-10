"use client";

import { useActionState, useEffect, useRef } from "react";
import { createAnnouncement, type AnnouncementState } from "./actions";
import { ANNOUNCEMENT_CATEGORIES } from "@/lib/announcements/categories";

const initialState: AnnouncementState = { error: null };
const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100";

export default function AnnouncementForm({ businessId }: { businessId: string }) {
  const [state, formAction, pending] = useActionState((prev: AnnouncementState, fd: FormData) => createAnnouncement(businessId, prev, fd), initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    if (submitted.current && !pending && !state.error) formRef.current?.reset();
  }, [pending, state.error]);

  return (
    <form
      ref={formRef}
      action={(fd) => {
        submitted.current = true;
        formAction(fd);
      }}
      className="space-y-3"
    >
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Judul</label>
        <input name="title" required maxLength={120} placeholder="mis. Libur Maulid Nabi" className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Isi (opsional)</label>
        <textarea name="body" rows={4} maxLength={2000} className={inputClass} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Kategori</label>
          <select name="category" defaultValue="info" className={inputClass}>
            {ANNOUNCEMENT_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Tampil sampai (opsional)</label>
          <input name="expires_at" type="date" className={inputClass} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm text-zinc-700">
        <input type="checkbox" name="pinned" className="h-4 w-4 rounded border-zinc-300" />
        Sematkan di atas
      </label>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60">
        {pending ? "Menyimpan…" : "Terbitkan"}
      </button>
    </form>
  );
}
