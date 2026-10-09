"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { removeProfilePhoto, uploadProfilePhoto } from "./actions";

const SIZE = 480;

// Perkecil + potong persegi di browser supaya unggahan kecil (±50 KB) dan cepat
// walau foto aslinya dari kamera HP (beberapa MB).
async function resizeToSquareJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas tidak tersedia");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Gagal memproses foto"))), "image/jpeg", 0.85),
  );
}

export default function PhotoUploader({ slug, hasPhoto }: { slug: string; hasPhoto: boolean }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(task: () => Promise<{ error: string | null; success?: string | null }>) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await task();
        setMessage(result.error ? { text: result.error, ok: false } : { text: result.success ?? "Selesai.", ok: true });
        if (!result.error) router.refresh();
      } catch {
        setMessage({ text: "Gagal memproses foto. Coba foto lain.", ok: false });
      }
    });
  }

  return (
    <div className="mt-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          run(async () => {
            const blob = await resizeToSquareJpeg(file);
            const fd = new FormData();
            fd.append("photo", new File([blob], "foto.jpg", { type: "image/jpeg" }));
            return uploadProfilePhoto(slug, fd);
          });
        }}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          onClick={() => inputRef.current?.click()}
          className="rounded-xl bg-portal-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Memproses…" : hasPhoto ? "Ganti Foto" : "Tambah Foto"}
        </button>
        {hasPhoto && (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              if (confirm("Hapus foto profil?")) run(() => removeProfilePhoto(slug));
            }}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-sm font-semibold text-zinc-600 disabled:opacity-60"
          >
            Hapus
          </button>
        )}
      </div>
      {message && (
        <p className={`mt-2 text-xs ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
      )}
    </div>
  );
}
