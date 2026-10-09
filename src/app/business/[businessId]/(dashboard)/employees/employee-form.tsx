"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionState } from "./actions";
import { BANK_OPTIONS } from "@/lib/employees/identity";

const initialState: ActionState = { error: null };

export type EmployeeFormValues = {
  id?: string;
  name: string;
  salary_type: "harian" | "bulanan";
  daily_rate: number;
  monthly_rate: number;
  note: string | null;
  email: string | null;
  contract_end: string | null;
  nik?: string | null;
  join_date?: string | null;
  bank_name?: string | null;
  bank_account_number?: string | null;
  bank_account_name?: string | null;
  daily_meal_allowance: number;
  daily_attendance_allowance: number;
  lembur_rate_per_hour: number | null;
  ptkp_status: string;
  bpjs_kesehatan?: boolean;
  bpjs_ketenagakerjaan?: boolean;
  bpjs_wage_base?: number | null;
  has_pin?: boolean;
};

const PTKP_OPTIONS = ["TK/0", "TK/1", "TK/2", "TK/3", "K/0", "K/1", "K/2", "K/3"];

export default function EmployeeForm({
  action,
  initial,
  submitLabel,
  onDone,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  initial?: EmployeeFormValues;
  submitLabel: string;
  onDone: () => void;
}) {
  const [state, formAction, pending] = useActionState(action, initialState);
  const [salaryType, setSalaryType] = useState<"harian" | "bulanan">(
    initial?.salary_type ?? "harian",
  );
  const hasSubmitted = useRef(false);

  useEffect(() => {
    if (!hasSubmitted.current) return;
    if (!pending && !state.error) onDone();
  }, [pending, state.error, onDone]);

  return (
    <form
      action={(formData) => {
        hasSubmitted.current = true;
        formAction(formData);
      }}
      className="space-y-4"
    >
      <div>
        <label htmlFor="name" className="mb-1 block text-xs font-medium text-zinc-600">
          Nama Karyawan
        </label>
        <input
          id="name"
          name="name"
          required
          defaultValue={initial?.name}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          placeholder="mis. Budi Santoso"
        />
      </div>

      <div>
        <label htmlFor="note" className="mb-1 block text-xs font-medium text-zinc-600">
          Divisi / Jabatan (opsional)
        </label>
        <input
          id="note"
          name="note"
          defaultValue={initial?.note ?? ""}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          placeholder="mis. Kasir, Dapur, Admin"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-xs font-medium text-zinc-600">
          Email (opsional)
        </label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={initial?.email ?? ""}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          placeholder="mis. budi@email.com — dipakai buat notifikasi cuti"
        />
      </div>

      <fieldset className="space-y-3 rounded-lg border border-zinc-100 bg-zinc-50/60 p-3">
        <legend className="px-1 text-xs font-semibold text-zinc-700">Data Pribadi &amp; Rekening</legend>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="nik" className="mb-1 block text-xs font-medium text-zinc-600">
              NIK (16 digit)
            </label>
            <input
              id="nik"
              name="nik"
              inputMode="numeric"
              maxLength={16}
              defaultValue={initial?.nik ?? ""}
              placeholder="3173xxxxxxxxxxxx"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label htmlFor="join_date" className="mb-1 block text-xs font-medium text-zinc-600">
              Tanggal Masuk Kerja
            </label>
            <input
              id="join_date"
              name="join_date"
              type="date"
              defaultValue={initial?.join_date ?? ""}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="bank_name" className="mb-1 block text-xs font-medium text-zinc-600">
              Bank / E-Wallet
            </label>
            <input
              id="bank_name"
              name="bank_name"
              list="bank-options"
              defaultValue={initial?.bank_name ?? ""}
              placeholder="mis. BCA"
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
            <datalist id="bank-options">
              {BANK_OPTIONS.map((b) => (
                <option key={b} value={b} />
              ))}
            </datalist>
          </div>
          <div>
            <label htmlFor="bank_account_number" className="mb-1 block text-xs font-medium text-zinc-600">
              No. Rekening
            </label>
            <input
              id="bank_account_number"
              name="bank_account_number"
              inputMode="numeric"
              maxLength={24}
              defaultValue={initial?.bank_account_number ?? ""}
              className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>
        <div>
          <label htmlFor="bank_account_name" className="mb-1 block text-xs font-medium text-zinc-600">
            Atas Nama Rekening
          </label>
          <input
            id="bank_account_name"
            name="bank_account_name"
            maxLength={100}
            defaultValue={initial?.bank_account_name ?? ""}
            placeholder="Sesuai buku tabungan"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1.5 block text-xs font-medium text-zinc-600">Tipe Gaji</legend>
        <div className="grid grid-cols-2 gap-2">
          <label
            className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
              salaryType === "harian"
                ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            <input
              type="radio"
              name="salary_type"
              value="harian"
              className="sr-only"
              checked={salaryType === "harian"}
              onChange={() => setSalaryType("harian")}
            />
            Harian
          </label>
          <label
            className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm ${
              salaryType === "bulanan"
                ? "border-brand-600 bg-brand-50 font-semibold text-brand-700"
                : "border-zinc-200 text-zinc-600"
            }`}
          >
            <input
              type="radio"
              name="salary_type"
              value="bulanan"
              className="sr-only"
              checked={salaryType === "bulanan"}
              onChange={() => setSalaryType("bulanan")}
            />
            Bulanan
          </label>
        </div>
      </fieldset>

      {salaryType === "harian" ? (
        <div>
          <label htmlFor="daily_rate" className="mb-1 block text-xs font-medium text-zinc-600">
            Gaji per Hari (Rp)
          </label>
          <input
            id="daily_rate"
            name="daily_rate"
            type="number"
            min={0}
            step={1000}
            defaultValue={initial?.daily_rate ?? 0}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      ) : (
        <div>
          <label htmlFor="monthly_rate" className="mb-1 block text-xs font-medium text-zinc-600">
            Gaji per Bulan (Rp)
          </label>
          <input
            id="monthly_rate"
            name="monthly_rate"
            type="number"
            min={0}
            step={1000}
            defaultValue={initial?.monthly_rate ?? 0}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      )}
      {/* Field tipe gaji yang sedang tidak dipilih tetap dikirim sebagai 0
          (hidden), supaya server action selalu menerima kedua field. */}
      {salaryType === "harian" && <input type="hidden" name="monthly_rate" value={0} />}
      {salaryType === "bulanan" && <input type="hidden" name="daily_rate" value={0} />}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="daily_meal_allowance"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Uang Makan / hari hadir (Rp)
          </label>
          <input
            id="daily_meal_allowance"
            name="daily_meal_allowance"
            type="number"
            min={0}
            step={1000}
            defaultValue={initial?.daily_meal_allowance ?? 0}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label
            htmlFor="daily_attendance_allowance"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Tunjangan Hadir / hari (Rp)
          </label>
          <input
            id="daily_attendance_allowance"
            name="daily_attendance_allowance"
            type="number"
            min={0}
            step={1000}
            defaultValue={initial?.daily_attendance_allowance ?? 0}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label
            htmlFor="lembur_rate_per_hour"
            className="mb-1 block text-xs font-medium text-zinc-600"
          >
            Tarif Lembur/jam (opsional)
          </label>
          <input
            id="lembur_rate_per_hour"
            name="lembur_rate_per_hour"
            type="number"
            min={0}
            step={1000}
            defaultValue={initial?.lembur_rate_per_hour ?? ""}
            placeholder="Pakai default bisnis"
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div>
          <label htmlFor="contract_end" className="mb-1 block text-xs font-medium text-zinc-600">
            Kontrak Berakhir (opsional)
          </label>
          <input
            id="contract_end"
            name="contract_end"
            type="date"
            defaultValue={initial?.contract_end ?? ""}
            className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div>
        <label htmlFor="ptkp_status" className="mb-1 block text-xs font-medium text-zinc-600">
          Status PTKP
        </label>
        <select
          id="ptkp_status"
          name="ptkp_status"
          defaultValue={initial?.ptkp_status ?? "TK/0"}
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {PTKP_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <p className="mt-1 text-[11px] text-zinc-400">
          Dipakai untuk hitung PPh 21 kalau fitur pajak diaktifkan di Pengaturan.
        </p>
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-xs font-medium text-zinc-600">BPJS</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="bpjs_kesehatan"
              defaultChecked={initial?.bpjs_kesehatan ?? true}
              className="rounded"
            />
            BPJS Kesehatan
          </label>
          <label className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              name="bpjs_ketenagakerjaan"
              defaultChecked={initial?.bpjs_ketenagakerjaan ?? true}
              className="rounded"
            />
            BPJS Ketenagakerjaan (JHT, JP, JKK, JKM)
          </label>
        </div>
        <input
          name="bpjs_wage_base"
          type="number"
          min={0}
          step={1000}
          defaultValue={initial?.bpjs_wage_base ?? ""}
          placeholder="Upah dasar BPJS (opsional)"
          className="mt-2 w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-[11px] text-zinc-400">
          Kosongkan untuk pakai gaji pokok slip + tunjangan tetap. Isi kalau upah yang didaftarkan
          ke BPJS berbeda (mis. sesuai UMK). Hanya berlaku kalau BPJS diaktifkan di Pengaturan.
        </p>
      </fieldset>

      <div>
        <label htmlFor="attendance_pin" className="mb-1 block text-xs font-medium text-zinc-600">
          PIN Absen {initial?.has_pin ? "(sudah terpasang — isi untuk mengganti)" : "(opsional)"}
        </label>
        <input
          id="attendance_pin"
          name="attendance_pin"
          type="password"
          inputMode="numeric"
          autoComplete="new-password"
          pattern="\d{4,6}"
          maxLength={6}
          placeholder="4–6 digit"
          className="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        <p className="mt-1 text-[11px] text-zinc-400">
          Diminta saat karyawan absen selfie, supaya tidak bisa dititipkan ke orang lain. Beri tahu
          PIN ini ke karyawan yang bersangkutan saja.
        </p>
        {initial?.has_pin && (
          <label className="mt-1.5 flex items-center gap-2 text-xs text-zinc-600">
            <input type="checkbox" name="remove_attendance_pin" className="rounded" />
            Hapus PIN absen
          </label>
        )}
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{state.error}</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onDone}
          className="flex-1 rounded-lg border border-zinc-200 py-2.5 text-sm font-medium text-zinc-600 hover:bg-zinc-50"
        >
          Batal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="flex-1 rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Menyimpan…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
