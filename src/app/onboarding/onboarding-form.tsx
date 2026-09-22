"use client";

import { useActionState } from "react";
import { createBusiness, type CreateBusinessState } from "./actions";

const initialState: CreateBusinessState = { error: null };

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(createBusiness, initialState);

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600">
          <span className="text-lg font-bold text-white">A</span>
        </div>
        <h1 className="text-xl font-bold text-zinc-900">Daftarkan Bisnis Kamu</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Satu langkah lagi sebelum mulai pakai ABSENKU
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-xs font-medium text-zinc-600">
            Nama Bisnis
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="mis. Toko Sumber Rejeki"
          />
        </div>

        <div>
          <label htmlFor="address" className="mb-1 block text-xs font-medium text-zinc-600">
            Alamat (opsional)
          </label>
          <input
            id="address"
            name="address"
            type="text"
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="Jl. Contoh No. 1"
          />
        </div>

        <div>
          <label htmlFor="phone" className="mb-1 block text-xs font-medium text-zinc-600">
            No. Telepon (opsional)
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full rounded-xl border border-zinc-200 px-3.5 py-2.5 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="08xxxxxxxxxx"
          />
        </div>

        {state.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-xl bg-brand-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : "Mulai Pakai ABSENKU"}
        </button>
      </form>
    </div>
  );
}
