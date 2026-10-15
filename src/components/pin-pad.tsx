"use client";

import { Delete } from "lucide-react";

// Keypad PIN bergaya Kasirku: 4 titik + tombol angka besar. PIN absen HrCash
// tepat 4 digit, jadi `onComplete` dipanggil begitu digit ke-4 diketik (login
// langsung jalan tanpa tombol), persis seperti Kasirku.
export function PinPad({
  value,
  onChange,
  onComplete,
  disabled,
  length = 4,
  compact,
  activeClass = "border-brand-600 bg-brand-600",
}: {
  value: string;
  onChange: (next: string) => void;
  onComplete?: (pin: string) => void;
  disabled?: boolean;
  length?: number;
  compact?: boolean;
  activeClass?: string;
}) {
  function press(k: string) {
    if (disabled) return;
    if (k === "back") return onChange(value.slice(0, -1));
    if (value.length >= length) return;
    const next = value + k;
    onChange(next);
    if (next.length === length) onComplete?.(next);
  }

  const key = `${compact ? "h-12 text-lg" : "h-14 text-xl"} touch-manipulation select-none rounded-2xl bg-zinc-100 font-bold text-zinc-800 transition-colors hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50`;

  return (
    <div>
      <div className="mb-5 flex justify-center gap-3" role="img" aria-label={`PIN terisi ${value.length} dari ${length} digit`}>
        {Array.from({ length }).map((_, i) => (
          <div key={i} className={`h-3.5 w-3.5 rounded-full border-2 ${i < value.length ? activeClass : "border-zinc-300"}`} />
        ))}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((n) => (
          <button key={n} type="button" onClick={() => press(n)} disabled={disabled} className={key}>
            {n}
          </button>
        ))}
        <div />
        <button type="button" onClick={() => press("0")} disabled={disabled} className={key}>
          0
        </button>
        <button type="button" onClick={() => press("back")} disabled={disabled} className={key}>
          <Delete className="mx-auto h-5 w-5" aria-label="Hapus" />
        </button>
      </div>
    </div>
  );
}
