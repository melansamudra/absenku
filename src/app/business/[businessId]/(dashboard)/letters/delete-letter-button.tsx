"use client";

import { deleteLetter } from "./actions";

export default function DeleteLetterButton({ businessId, letterId }: { businessId: string; letterId: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Hapus surat ini?")) deleteLetter(businessId, letterId);
      }}
      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
    >
      Hapus
    </button>
  );
}
