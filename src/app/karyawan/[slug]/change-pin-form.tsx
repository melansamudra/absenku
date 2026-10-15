"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { changePortalPin } from "./actions";

const inputClass =
  "w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm tracking-widest focus:border-portal-600 focus:outline-none focus:ring-2 focus:ring-portal-100";

// PIN lama boleh sampai 6 digit (PIN lama sebelum aturan 4 digit); PIN baru 4 digit.
function PinField({ name, label, max = 4 }: { name: string; label: string; max?: number }) {
  const [value, setValue] = useState("");
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600">{label}</label>
      <input
        name={name}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        maxLength={max}
        required
        value={value}
        onChange={(e) => setValue(e.target.value.replace(/\D/g, ""))}
        placeholder={max === 4 ? "4 digit" : "PIN lama"}
        className={inputClass}
      />
    </div>
  );
}

export default function ChangePinForm({ slug }: { slug: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [pending, startTransition] = useTransition();

  function run(formData: FormData) {
    setMessage(null);
    startTransition(async () => {
      const result = await changePortalPin(slug, formData);
      setMessage({ text: result.error ?? result.success ?? "Selesai.", ok: !result.error });
      if (!result.error) {
        formRef.current?.reset();
        router.refresh();
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600"
      >
        Ganti PIN Absen
      </button>
    );
  }

  return (
    <form ref={formRef} action={run} className="space-y-3 rounded-2xl border border-zinc-200 p-4">
      <p className="text-xs text-zinc-500">
        PIN ini dipakai untuk masuk ke portal ini dan check-in/out absen. Jaga agar tidak diketahui
        orang lain.
      </p>
      <PinField name="current_pin" label="PIN Lama" max={6} />
      <PinField name="new_pin" label="PIN Baru" />
      <PinField name="confirm_pin" label="Ulangi PIN Baru" />
      {message && (
        <p className={`text-xs ${message.ok ? "text-emerald-700" : "text-red-600"}`}>{message.text}</p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-xl bg-portal-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Simpan PIN Baru"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600"
        >
          Batal
        </button>
      </div>
    </form>
  );
}
