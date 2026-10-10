"use client";

import { deleteAnnouncement, setAnnouncementPinned } from "./actions";

export type AnnouncementItem = { id: string; title: string; body: string | null; categoryLabel: string; pinned: boolean; date: string; expiresLabel: string | null; expired: boolean };

export default function AnnouncementRow({ businessId, item }: { businessId: string; item: AnnouncementItem }) {
  return (
    <div className="flex flex-col gap-2 px-5 py-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-zinc-900">
          {item.pinned && <span title="Disematkan">📌 </span>}
          {item.title}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {item.categoryLabel} · {item.date}
          {item.expiresLabel && <span className={item.expired ? " font-semibold text-red-600" : ""}> · {item.expired ? "berakhir" : "tampil sampai"} {item.expiresLabel}</span>}
        </p>
        {item.body && <p className="mt-1 line-clamp-2 whitespace-pre-wrap text-xs text-zinc-400">{item.body}</p>}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button type="button" onClick={() => setAnnouncementPinned(businessId, item.id, !item.pinned)} className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-semibold text-zinc-600 hover:bg-zinc-50">
          {item.pinned ? "Lepas sematan" : "Sematkan"}
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm("Hapus pengumuman ini?")) deleteAnnouncement(businessId, item.id);
          }}
          className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50"
        >
          Hapus
        </button>
      </div>
    </div>
  );
}
