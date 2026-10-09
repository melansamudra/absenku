"use client";

import { useActionState, useState } from "react";
import { createLetter, type LetterActionState } from "./actions";
import { LETTER_KINDS, letterTemplate, type LetterKind } from "@/lib/letters/templates";

const initialState: LetterActionState = { error: null };
const inputClass = "w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm";

export default function LetterForm({
  businessId,
  businessName,
  employees,
  today,
}: {
  businessId: string;
  businessName: string;
  employees: { id: string; name: string }[];
  today: string;
}) {
  const [state, formAction, pending] = useActionState(
    (prev: LetterActionState, formData: FormData) => createLetter(businessId, prev, formData),
    initialState,
  );
  const [employeeId, setEmployeeId] = useState("");
  const [kind, setKind] = useState<LetterKind>("sp1");
  const initial = letterTemplate("sp1", "", businessName);
  const [subject, setSubject] = useState(initial.subject);
  const [body, setBody] = useState(initial.body);

  // Template diisi ulang tiap jenis surat/karyawan berubah; teks yang sudah
  // diketik admin akan tertimpa, jadi pilih jenis & karyawan dulu baru edit isi.
  function applyTemplate(nextKind: LetterKind, nextEmployeeId: string) {
    const name = employees.find((e) => e.id === nextEmployeeId)?.name ?? "";
    const t = letterTemplate(nextKind, name, businessName);
    setSubject(t.subject);
    setBody(t.body);
  }

  return (
    <form action={formAction} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Karyawan</label>
          <select
            name="employee_id"
            required
            value={employeeId}
            onChange={(e) => {
              setEmployeeId(e.target.value);
              applyTemplate(kind, e.target.value);
            }}
            className={inputClass}
          >
            <option value="" disabled>
              — Pilih karyawan —
            </option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Jenis surat</label>
          <select
            name="kind"
            value={kind}
            onChange={(e) => {
              const k = e.target.value as LetterKind;
              setKind(k);
              applyTemplate(k, employeeId);
            }}
            className={inputClass}
          >
            {Object.entries(LETTER_KINDS).map(([k, label]) => (
              <option key={k} value={k}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">Tanggal surat</label>
          <input name="issued_date" type="date" required defaultValue={today} className={inputClass} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Nomor surat (kosongkan untuk otomatis)
          </label>
          <input name="letter_number" maxLength={60} placeholder="mis. 001/SP1/X/2026" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Perihal</label>
        <input
          name="subject"
          required
          maxLength={200}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">Isi surat</label>
        <textarea
          name="body"
          required
          rows={10}
          maxLength={5000}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className={inputClass}
        />
      </div>
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Menyimpan…" : "Simpan & Lihat Surat"}
      </button>
    </form>
  );
}
