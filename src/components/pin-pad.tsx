"use client";

import { Delete } from "lucide-react";

// Keypad PIN bergaya Kasirku (titik + tombol angka besar). Beda dengan Kasirku
// yang PIN-nya tetap 4 digit: PIN absen HrCash 4–6 digit, jadi tidak ada kirim
// otomatis di digit ke-4 — pemilik komponen yang menentukan kapan PIN dikirim
// (tombol "Masuk" / "Absen") dan titik bertambah mulai digit ke-5.
export function PinPad({
  value,
  onChange,
  disabled,
  min = 4,
  max = 6,
  compact,
  activeClass = "border-brand-600 bg-brand-600",
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  compact?: boolean;
  activeClass?: string;
}) {
  const dots = Math.min(max, Math.max(min, value.length));

  function press(k: string) {
    if (disabled) return;
    if (k === "back") return onChange(value.slice(0, -1));
    if (value.length >= max) return;
    onChange(value + k);
  }

  const key = `${compact ? "h-12 text-lg" : "h-14 text-xl"} touch-manipulation select-none rounded-2xl bg-zinc-100 font-bold text-zinc-800 transition-colors hover:bg-zinc-200 active:bg-zinc-300 disabled:opacity-50`;

  return (
    <div>
      <div className="mb-4 flex justify-center gap-3" role="img" aria-label={`PIN terisi ${value.length} digit`}>
        {Array.from({ length: dots }).map((_, i) => (
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
