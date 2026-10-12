"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { Check, Plus } from "lucide-react";
import type { Tables } from "@/lib/types/database";
import { Card, Field, SectionTitle, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import {
  BANKS,
  BLOOD_TYPES,
  CONTRACT_STATUSES,
  EDU_LEVELS,
  EMPLOYMENT_STATUSES,
  ID_TYPES,
  MARITAL_STATUSES,
  PLACEMENT_TYPES,
  PROVINCES,
  PTKP_OPTIONS,
  RELIGIONS,
} from "@/lib/employee/constants";
import { createMaster, type MasterKind, type WizardState } from "./wizard-actions";

type Employee = Tables<"employees">;
type Action = (prev: WizardState, fd: FormData) => Promise<WizardState>;
type Option = { id: string; name: string };

const initial: WizardState = { error: null };

const STEPS = ["Personal", "Kepegawaian", "Payroll"];

export function Stepper({
  current,
  basePath,
  employeeId,
}: {
  current: 1 | 2 | 3;
  basePath: string;
  employeeId: string | null;
}) {
  return (
    <div className="flex items-start justify-between">
      {STEPS.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        const reachable = employeeId && n !== current;
        const dot = (
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              active
                ? "bg-brand-600 text-white"
                : done
                  ? "bg-brand-100 text-brand-700"
                  : "bg-zinc-100 text-zinc-400"
            }`}
          >
            {done ? <Check size={14} /> : n}
          </span>
        );
        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              {reachable ? (
                <Link href={`${basePath}/${employeeId}/setup/${n}`} aria-label={`Langkah ${n}: ${label}`}>
                  {dot}
                </Link>
              ) : (
                dot
              )}
              <span className={`text-xs ${active ? "font-semibold text-zinc-900" : "text-zinc-400"}`}>{label}</span>
            </div>
            {n < 3 && <div className={`mx-3 mt-3.5 h-px flex-1 ${done ? "bg-brand-300" : "bg-zinc-200"}`} />}
          </div>
        );
      })}
    </div>
  );
}

function ErrorBox({ error }: { error: string | null }) {
  if (!error) return null;
  return <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>;
}

function FormFooter({
  pending,
  backHref,
  nextLabel,
  skipHref,
}: {
  pending: boolean;
  backHref: string;
  nextLabel: string;
  skipHref?: string;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-4">
      <Link href={backHref} className={btnOutline}>
        Kembali
      </Link>
      <div className="flex items-center gap-2">
        {skipHref && (
          <Link href={skipHref} className="px-2 text-xs font-medium text-zinc-500 hover:text-zinc-800">
            Lengkapi nanti
          </Link>
        )}
        <button type="submit" disabled={pending} className={btnPrimary}>
          {pending ? "Menyimpan…" : nextLabel}
        </button>
      </div>
    </div>
  );
}

// ── Langkah 1: Personal ──────────────────────────────────────────────────
export function Step1Form({
  action,
  employee,
  backHref,
  skipHref,
}: {
  action: Action;
  employee: Employee | null;
  backHref: string;
  skipHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [citizenship, setCitizenship] = useState(employee?.citizenship ?? "WNI");
  const [domSame, setDomSame] = useState(employee?.domicile_same ?? true);
  const e = employee;

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <SectionTitle>Informasi Pribadi</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="ID Karyawan" hint="Otomatis, mis. EMP00001" className="sm:col-span-2">
            <input className={inputClass} value={e?.employee_code ?? ""} placeholder="Dibuat otomatis" disabled readOnly />
          </Field>
          <Field label="Nama Lengkap" required className="sm:col-span-2">
            <input name="name" className={inputClass} defaultValue={e?.name} placeholder="Nama Lengkap" />
          </Field>
          <Field label="Tempat Lahir" required>
            <input name="birth_place" className={inputClass} defaultValue={e?.birth_place ?? ""} placeholder="Tempat Lahir" />
          </Field>
          <Field label="Tanggal Lahir" required>
            <input name="birth_date" type="date" className={inputClass} defaultValue={e?.birth_date ?? ""} />
          </Field>
          <Field label="Jenis Kelamin">
            <div className="flex gap-4 py-2">
              {[
                ["L", "Laki-laki"],
                ["P", "Perempuan"],
              ].map(([v, l]) => (
                <label key={v} className="flex items-center gap-2 text-[14px] text-zinc-700">
                  <input type="radio" name="gender" value={v} defaultChecked={(e?.gender ?? "L") === v} className="accent-[var(--color-brand-600)]" />
                  {l}
                </label>
              ))}
            </div>
          </Field>
          <Field label="Status Perkawinan" required>
            <select name="marital_status" className={inputClass} defaultValue={e?.marital_status ?? ""}>
              <option value="">Status Perkawinan</option>
              {MARITAL_STATUSES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Golongan Darah">
            <select name="blood_type" className={inputClass} defaultValue={e?.blood_type ?? ""}>
              <option value="">Golongan Darah</option>
              {BLOOD_TYPES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Agama" required>
            <select name="religion" className={inputClass} defaultValue={e?.religion ?? ""}>
              <option value="">Agama</option>
              {RELIGIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Status Warga Negara" required>
            <select
              name="citizenship"
              className={inputClass}
              value={citizenship}
              onChange={(ev) => setCitizenship(ev.target.value)}
            >
              <option value="WNI">WNI</option>
              <option value="WNA">WNA</option>
            </select>
          </Field>
          {citizenship === "WNA" && (
            <Field label="Negara Asal">
              <input name="citizenship_country" className={inputClass} defaultValue={e?.citizenship_country ?? ""} />
            </Field>
          )}
        </div>
      </div>

      <div>
        <SectionTitle>Informasi Kontak</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipe Kartu Identitas" required>
            <select name="id_type" className={inputClass} defaultValue={e?.id_type ?? "KTP"}>
              {ID_TYPES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="ID Kartu Identitas" required>
            <input name="id_number" className={inputClass} defaultValue={e?.nik ?? e?.id_number ?? ""} placeholder="Nomor identitas" />
          </Field>
          <Field label="Nomor Kartu Keluarga">
            <input name="family_card_number" className={inputClass} defaultValue={e?.family_card_number ?? ""} />
          </Field>
          <Field label="Email" required hint="Dipakai untuk notifikasi cuti.">
            <input name="email" type="email" className={inputClass} defaultValue={e?.email ?? ""} placeholder="nama@email.com" />
          </Field>
          <Field label="Nomor Ponsel" required>
            <input name="phone" type="tel" className={inputClass} defaultValue={e?.phone ?? ""} placeholder="08xxxxxxxxxx" />
          </Field>
          <Field label="Nomor Telepon">
            <input name="phone_alt" type="tel" className={inputClass} defaultValue={e?.phone_alt ?? ""} />
          </Field>
          <Field label="Alamat Kartu Identitas" required className="sm:col-span-2">
            <textarea name="id_address" rows={2} className={inputClass} defaultValue={e?.id_address ?? ""} placeholder="Alamat sesuai kartu identitas" />
          </Field>
          <Field label="Negara" required>
            <input name="id_country" className={inputClass} defaultValue={e?.id_country ?? "Indonesia"} />
          </Field>
          <Field label="Provinsi" required>
            <select name="id_province" className={inputClass} defaultValue={e?.id_province ?? ""}>
              <option value="">Provinsi</option>
              {PROVINCES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Kota / Kabupaten" required className="sm:col-span-2">
            <input name="id_city" className={inputClass} defaultValue={e?.id_city ?? ""} placeholder="Kota / Kabupaten" />
          </Field>

          <label className="flex items-center gap-2 text-[14px] text-zinc-700 sm:col-span-2">
            <input
              type="checkbox"
              name="domicile_same"
              checked={domSame}
              onChange={(ev) => setDomSame(ev.target.checked)}
              className="h-4 w-4 accent-[var(--color-brand-600)]"
            />
            Alamat domisili sama dengan alamat kartu identitas
          </label>

          {!domSame && (
            <>
              <Field label="Alamat Domisili" required className="sm:col-span-2">
                <textarea name="dom_address" rows={2} className={inputClass} defaultValue={e?.dom_address ?? ""} />
              </Field>
              <Field label="Negara Domisili" required>
                <input name="dom_country" className={inputClass} defaultValue={e?.dom_country ?? "Indonesia"} />
              </Field>
              <Field label="Provinsi Domisili" required>
                <select name="dom_province" className={inputClass} defaultValue={e?.dom_province ?? ""}>
                  <option value="">Provinsi Domisili</option>
                  {PROVINCES.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Kota Domisili" required className="sm:col-span-2">
                <input name="dom_city" className={inputClass} defaultValue={e?.dom_city ?? ""} />
              </Field>
            </>
          )}

          <Field label="Nama Kontak Darurat" required>
            <input name="emergency_name" className={inputClass} defaultValue={e?.emergency_name ?? ""} />
          </Field>
          <Field label="Telepon Darurat" required>
            <input name="emergency_phone" type="tel" className={inputClass} defaultValue={e?.emergency_phone ?? ""} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Pendidikan Terakhir</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jenjang Akademik">
            <select name="edu_level" className={inputClass} defaultValue={e?.edu_level ?? ""}>
              <option value="">Jenjang Akademik</option>
              {EDU_LEVELS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Nama Lembaga Pendidikan">
            <input name="edu_institution" className={inputClass} defaultValue={e?.edu_institution ?? ""} />
          </Field>
          <Field label="Program Studi" className="sm:col-span-2">
            <input name="edu_major" className={inputClass} defaultValue={e?.edu_major ?? ""} />
          </Field>
        </div>
      </div>

      <ErrorBox error={state.error} />
      <FormFooter pending={pending} backHref={backHref} nextLabel="Selanjutnya" skipHref={skipHref} />
    </form>
  );
}

// ── Dropdown master dengan "+ Tambah …" inline ───────────────────────────
function MasterSelect({
  businessId,
  kind,
  label,
  noun,
  required,
  name,
  options,
  defaultValue,
}: {
  businessId: string;
  kind: MasterKind;
  label: string;
  noun: string;
  required?: boolean;
  name: string;
  options: Option[];
  defaultValue: string | null;
}) {
  const [items, setItems] = useState(options);
  const [value, setValue] = useState(defaultValue ?? "");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    setErr(null);
    const res = await createMaster(businessId, kind, draft);
    setBusy(false);
    if (res.error || !res.id) return setErr(res.error ?? "Gagal menambah.");
    setItems((l) => [...l, { id: res.id!, name: draft.trim() }].sort((a, b) => a.name.localeCompare(b.name)));
    setValue(res.id);
    setDraft("");
    setAdding(false);
  }

  return (
    <Field label={label} required={required}>
      <select name={name} className={inputClass} value={value} onChange={(ev) => setValue(ev.target.value)}>
        <option value="">Pilih {label}</option>
        {items.map((o) => (
          <option key={o.id} value={o.id}>
            {o.name}
          </option>
        ))}
      </select>
      {adding ? (
        <div className="mt-2 flex gap-2">
          <input
            autoFocus
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            onKeyDown={(ev) => {
              if (ev.key === "Enter") {
                ev.preventDefault();
                add();
              }
            }}
            placeholder={`Nama ${noun} baru`}
            className={inputClass}
          />
          <button type="button" onClick={add} disabled={busy} className={btnPrimary}>
            Simpan
          </button>
          <button type="button" onClick={() => setAdding(false)} className={btnOutline}>
            Batal
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-800"
        >
          <Plus size={13} /> Tambah {label}
        </button>
      )}
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
    </Field>
  );
}

// ── Langkah 2: Kepegawaian ───────────────────────────────────────────────
export function Step2Form({
  action,
  employee,
  businessId,
  organizations,
  positions,
  ranks,
  backHref,
  skipHref,
}: {
  action: Action;
  employee: Employee;
  businessId: string;
  organizations: Option[];
  positions: Option[];
  ranks: Option[];
  backHref: string;
  skipHref?: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [status, setStatus] = useState(employee.employment_status ?? "tetap");
  const e = employee;

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <SectionTitle>Kepegawaian</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Status Karyawan" required>
            <select
              name="employment_status"
              className={inputClass}
              value={status}
              onChange={(ev) => setStatus(ev.target.value)}
            >
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tanggal Bergabung" required>
            <input
              name="join_date"
              type="date"
              className={inputClass}
              defaultValue={e.join_date ?? new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}
            />
          </Field>
          <Field label="Penempatan Kerja" required className="sm:col-span-2">
            <select name="placement_type" className={inputClass} defaultValue={e.placement_type ?? "Baru Direkrut"}>
              {PLACEMENT_TYPES.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <MasterSelect
            businessId={businessId}
            kind="organizations"
            label="Organisasi"
            noun="organisasi"
            required
            name="organization_id"
            options={organizations}
            defaultValue={e.organization_id}
          />
          <MasterSelect
            businessId={businessId}
            kind="positions"
            label="Jabatan"
            noun="jabatan"
            required
            name="position_id"
            options={positions}
            defaultValue={e.position_id}
          />
          <MasterSelect
            businessId={businessId}
            kind="ranks"
            label="Pangkat"
            noun="pangkat"
            required
            name="rank_id"
            options={ranks}
            defaultValue={e.rank_id}
          />
          <Field label="Golongan">
            <input name="grade" className={inputClass} defaultValue={e.grade ?? ""} placeholder="Golongan (opsional)" />
          </Field>
          {CONTRACT_STATUSES.includes(status) && (
            <Field label="Tanggal Masa Akhir Kerja" hint="Untuk kontrak/percobaan: kapan masa kerja berakhir.">
              <input name="contract_end" type="date" className={inputClass} defaultValue={e.contract_end ?? ""} />
            </Field>
          )}
        </div>
      </div>

      <ErrorBox error={state.error} />
      <FormFooter pending={pending} backHref={backHref} nextLabel="Selanjutnya" skipHref={skipHref} />
    </form>
  );
}

// ── Langkah 3: Payroll ───────────────────────────────────────────────────
export function Step3Form({
  action,
  employee,
  backHref,
}: {
  action: Action;
  employee: Employee;
  backHref: string;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  const [salaryType, setSalaryType] = useState<"harian" | "bulanan">(
    employee.salary_type === "harian" ? "harian" : "bulanan",
  );
  const e = employee;

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <SectionTitle>Gaji &amp; Tunjangan</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Tipe Gaji" required className="sm:col-span-2">
            <div className="grid max-w-xs grid-cols-2 gap-2">
              {(["bulanan", "harian"] as const).map((t) => (
                <label
                  key={t}
                  className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-[14px] capitalize ${
                    salaryType === t
                      ? "border-brand-500 bg-brand-50 font-semibold text-brand-700"
                      : "border-zinc-200 text-zinc-600"
                  }`}
                >
                  <input type="radio" name="salary_type" value={t} className="sr-only" checked={salaryType === t} onChange={() => setSalaryType(t)} />
                  {t}
                </label>
              ))}
            </div>
          </Field>
          {salaryType === "harian" ? (
            <Field label="Gaji per Hari (Rp)">
              <input name="daily_rate" type="number" min={0} step={1000} className={inputClass} defaultValue={e.daily_rate} />
            </Field>
          ) : (
            <Field label="Gaji Pokok per Bulan (Rp)">
              <input name="monthly_rate" type="number" min={0} step={1000} className={inputClass} defaultValue={e.monthly_rate} />
            </Field>
          )}
          <Field label="Status PTKP" hint="Dipakai untuk PPh 21 jika diaktifkan di Pengaturan.">
            <select name="ptkp_status" className={inputClass} defaultValue={e.ptkp_status}>
              {PTKP_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          </Field>
          <Field label="Uang Makan / hari hadir (Rp)">
            <input name="daily_meal_allowance" type="number" min={0} step={1000} className={inputClass} defaultValue={e.daily_meal_allowance} />
          </Field>
          <Field label="Tunjangan Hadir / hari (Rp)">
            <input name="daily_attendance_allowance" type="number" min={0} step={1000} className={inputClass} defaultValue={e.daily_attendance_allowance} />
          </Field>
          <Field label="Tarif Lembur / jam (Rp)" hint="Kosongkan untuk pakai tarif default bisnis.">
            <input name="lembur_rate_per_hour" type="number" min={0} step={1000} className={inputClass} defaultValue={e.lembur_rate_per_hour ?? ""} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>NPWP</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="NPWP">
            <input name="npwp" className={inputClass} defaultValue={e.npwp ?? ""} placeholder="Nomor NPWP" />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>BPJS</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-[14px] text-zinc-700">
            <input type="checkbox" name="bpjs_kesehatan" defaultChecked={e.bpjs_kesehatan} className="h-4 w-4 accent-[var(--color-brand-600)]" />
            Potong BPJS Kesehatan di slip gaji
          </label>
          <label className="flex items-center gap-2 text-[14px] text-zinc-700">
            <input type="checkbox" name="bpjs_ketenagakerjaan" defaultChecked={e.bpjs_ketenagakerjaan} className="h-4 w-4 accent-[var(--color-brand-600)]" />
            Potong BPJS Ketenagakerjaan di slip gaji
          </label>
          <Field label="Dasar Upah BPJS (Rp)" hint="Kosongkan untuk memakai gaji pokok." className="sm:col-span-2">
            <input name="bpjs_wage_base" type="number" min={0} step={1000} className={inputClass} defaultValue={e.bpjs_wage_base ?? ""} />
          </Field>
          <Field label="No KPJ BPJS Ketenagakerjaan">
            <input name="bpjs_tk_number" className={inputClass} defaultValue={e.bpjs_tk_number ?? ""} />
          </Field>
          <Field label="Tanggal Efektif">
            <input name="bpjs_tk_effective" type="date" className={inputClass} defaultValue={e.bpjs_tk_effective ?? ""} />
          </Field>
          <Field label="No BPJS Kesehatan">
            <input name="bpjs_kes_number" className={inputClass} defaultValue={e.bpjs_kes_number ?? ""} />
          </Field>
          <Field label="Tanggal Efektif">
            <input name="bpjs_kes_effective" type="date" className={inputClass} defaultValue={e.bpjs_kes_effective ?? ""} />
          </Field>
          <Field label="Jumlah Anggota Keluarga BPJS Kesehatan">
            <input name="bpjs_family_count" type="number" min={0} className={inputClass} defaultValue={e.bpjs_family_count ?? ""} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>Nomor Rekening</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Bank">
            <select name="bank_name" className={inputClass} defaultValue={e.bank_name ?? ""}>
              <option value="">Pilih bank</option>
              {BANKS.map((b) => (
                <option key={b}>{b}</option>
              ))}
            </select>
          </Field>
          <Field label="Nomor Rekening" hint="5–20 digit angka.">
            <input name="bank_account_number" inputMode="numeric" className={inputClass} defaultValue={e.bank_account_number ?? ""} />
          </Field>
          <Field label="Nama Pemilik Rekening" className="sm:col-span-2">
            <input name="bank_account_name" className={inputClass} defaultValue={e.bank_account_name ?? e.name} />
          </Field>
        </div>
      </div>

      <div>
        <SectionTitle>PIN Absen</SectionTitle>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="PIN Absen (4–6 digit)"
            hint={e.attendance_pin_hash ? "PIN sudah diatur. Kosongkan jika tidak ingin mengubah." : "Dipakai karyawan untuk absen & masuk Portal Karyawan."}
          >
            <input name="attendance_pin" inputMode="numeric" maxLength={6} className={inputClass} placeholder="••••" />
          </Field>
        </div>
      </div>

      <ErrorBox error={state.error} />
      <FormFooter pending={pending} backHref={backHref} nextLabel="Simpan & Selesai" />
    </form>
  );
}

export function WizardCard({ children }: { children: React.ReactNode }) {
  return <Card>{children}</Card>;
}
