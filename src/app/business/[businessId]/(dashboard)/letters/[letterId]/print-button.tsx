"use client";

export default function PrintLetterButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-50"
    >
      🖨️ Cetak Surat
    </button>
  );
}
