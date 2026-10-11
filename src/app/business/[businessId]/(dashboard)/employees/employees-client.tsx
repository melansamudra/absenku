"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Download,
  MoreVertical,
  Plus,
  Search,
  Upload,
} from "lucide-react";
import { Card, PageHeader, btnOutline, btnPrimary, inputClass } from "@/components/form-ui";
import { employmentLabel } from "@/lib/employee/constants";
import {
  createEmployee,
  removeEmployeePhoto,
  setEmployeeActive,
  softDeleteEmployee,
  type ActionState,
} from "./actions";
import EmployeeForm from "./employee-form";
import ImportEmployeesModal from "./import-employees-modal";

export type EmployeeRow = {
  id: string;
  name: string;
  employee_code: string | null;
  salary_type: "harian" | "bulanan";
  daily_rate: number;
  monthly_rate: number;
  active: boolean;
  note: string | null;
  email: string | null;
  phone: string | null;
  id_number: string | null;
  nik: string | null;
  bank_name: string | null;
  bank_account_number: string | null;
  has_pin: boolean;
  photo_url: string | null;
  birth_date: string | null;
  gender: string | null;
  join_date: string | null;
  employment_status: string | null;
  contract_end: string | null;
  npwp: string | null;
  setup_complete: boolean;
  ptkp_status: string;
  organizations: { name: string } | null;
  positions: { name: string } | null;
  ranks: { name: string } | null;
};

type Tab = "pribadi" | "kontak" | "kepegawaian" | "payroll";
const TABS: { key: Tab; label: string }[] = [
  { key: "pribadi", label: "Informasi Pribadi" },
  { key: "kontak", label: "Kontak" },
  { key: "kepegawaian", label: "Kepegawaian" },
  { key: "payroll", label: "Payroll" },
];

const PER_PAGE = 15;

function csvCell(v: string | number | null | undefined) {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Ekspor daftar yang sedang tampil (sesuai filter & pencarian) ke CSV yang bisa dibuka di Excel.
function exportEmployeesCsv(rows: EmployeeRow[]) {
  const header = [
    "ID Karyawan", "Nama", "Email", "Nomor Ponsel", "NIK / No. Identitas", "Tanggal Lahir", "Jenis Kelamin",
    "Organisasi", "Jabatan", "Pangkat", "Status Karyawan", "Tanggal Bergabung", "Tipe Gaji", "Gaji", "PTKP", "NPWP", "Bank", "Nomor Rekening", "Status",
  ];
  const lines = rows.map((e) =>
    [
      e.employee_code, e.name, e.email, e.phone, e.nik ?? e.id_number, e.birth_date,
      e.gender === "P" ? "Perempuan" : e.gender === "L" ? "Laki-laki" : "",
      e.organizations?.name, e.positions?.name ?? e.note, e.ranks?.name, employmentLabel(e.employment_status), e.join_date,
      e.salary_type === "harian" ? "Harian" : "Bulanan", e.salary_type === "harian" ? e.daily_rate : e.monthly_rate,
      e.ptkp_status, e.npwp, e.bank_name, e.bank_account_number, e.active ? "Aktif" : "Nonaktif",
    ]
      .map(csvCell)
      .join(","),
  );
  const blob = new Blob(["﻿" + [header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `karyawan-${new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" })}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

const rp = (v: number) => `Rp ${Math.round(v).toLocaleString("id-ID")}`;
function fmtDate(v: string | null) {
  if (!v) return "—";
  return new Date(`${v}T00:00:00`).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

const COLUMNS: Record<Tab, { head: string; cell: (e: EmployeeRow) => React.ReactNode }[]> = {
  pribadi: [
    { head: "ID Karyawan", cell: (e) => e.employee_code ?? "—" },
    { head: "Jenis Kelamin", cell: (e) => (e.gender === "P" ? "Perempuan" : e.gender === "L" ? "Laki-laki" : "—") },
    { head: "Tanggal Lahir", cell: (e) => fmtDate(e.birth_date) },
    { head: "NIK / No. Identitas", cell: (e) => e.nik ?? e.id_number ?? "—" },
  ],
  kontak: [
    { head: "Email", cell: (e) => e.email ?? "—" },
    { head: "Nomor Ponsel", cell: (e) => e.phone ?? "—" },
  ],
  kepegawaian: [
    { head: "Organisasi", cell: (e) => e.organizations?.name ?? "—" },
    { head: "Jabatan", cell: (e) => e.positions?.name ?? e.note ?? "—" },
    { head: "Pangkat", cell: (e) => e.ranks?.name ?? "—" },
    { head: "Status", cell: (e) => employmentLabel(e.employment_status) },
    { head: "Tgl Bergabung", cell: (e) => fmtDate(e.join_date) },
  ],
  payroll: [
    { head: "Tipe Gaji", cell: (e) => (e.salary_type === "harian" ? "Harian" : "Bulanan") },
    { head: "Gaji", cell: (e) => (e.salary_type === "harian" ? `${rp(e.daily_rate)}/hari` : `${rp(e.monthly_rate)}/bln`) },
    { head: "PTKP", cell: (e) => e.ptkp_status },
    { head: "NPWP", cell: (e) => e.npwp ?? "—" },
    { head: "Rekening", cell: (e) => (e.bank_name ? `${e.bank_name} ${e.bank_account_number ?? ""}`.trim() : "—") },
  ],
};

export default function EmployeesClient({
  businessId,
  employees,
}: {
  businessId: string;
  employees: EmployeeRow[];
}) {
  const base = `/business/${businessId}/employees`;
  const [tab, setTab] = useState<Tab>("pribadi");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"aktif" | "nonaktif" | "semua">("aktif");
  const [page, setPage] = useState(1);
  const [addMenu, setAddMenu] = useState(false);
  const [rowMenu, setRowMenu] = useState<string | null>(null);
  const [quick, setQuick] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const incomplete = employees.filter((e) => !e.setup_complete && e.active).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return employees.filter((e) => {
      if (filter === "aktif" && !e.active) return false;
      if (filter === "nonaktif" && e.active) return false;
      if (!q) return true;
      return [e.name, e.employee_code, e.email, e.phone, e.positions?.name, e.organizations?.name, e.note]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [employees, query, filter]);

  const pages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const cols = COLUMNS[tab];

  const boundCreate = (prevState: ActionState, formData: FormData) =>
    createEmployee(businessId, prevState, formData);

  return (
    <div>
      {incomplete > 0 && (
        <div className="mb-4 flex items-center gap-3 rounded-xl border-l-4 border-amber-400 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
          <AlertTriangle size={16} className="shrink-0 text-amber-500" />
          <span>
            Ada <b>{incomplete}</b> karyawan yang datanya belum lengkap. Klik namanya lalu pilih{" "}
            <b>Lengkapi Data</b>.
          </span>
        </div>
      )}

      <Card className="!p-0">
        <div className="p-5 sm:p-6">
          <PageHeader
            title="Karyawan"
            subtitle={`${employees.filter((e) => e.active).length} karyawan aktif`}
            actions={
              <>
                <div className="relative">
                  <button type="button" onClick={() => setAddMenu((v) => !v)} className={btnPrimary}>
                    <Plus size={15} /> Tambah Karyawan <ChevronDown size={14} />
                  </button>
                  {addMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setAddMenu(false)} />
                      <div className="absolute right-0 z-20 mt-1.5 w-64 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                        <Link
                          href={`${base}/add`}
                          className="block px-4 py-2.5 hover:bg-zinc-50"
                          onClick={() => setAddMenu(false)}
                        >
                          <p className="text-[13px] font-semibold text-zinc-900">Tambah Lengkap</p>
                          <p className="text-xs text-zinc-400">3 langkah: personal, kepegawaian, payroll</p>
                        </Link>
                        <button
                          type="button"
                          className="block w-full px-4 py-2.5 text-left hover:bg-zinc-50"
                          onClick={() => {
                            setAddMenu(false);
                            setQuick(true);
                          }}
                        >
                          <p className="text-[13px] font-semibold text-zinc-900">Tambah Cepat</p>
                          <p className="text-xs text-zinc-400">Nama, jabatan &amp; gaji saja</p>
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <button type="button" onClick={() => setShowImport(true)} className={btnOutline}>
                  <Upload size={14} /> Import CSV
                </button>
                <button type="button" onClick={() => exportEmployeesCsv(filtered)} className={btnOutline}>
                  <Download size={14} /> Ekspor
                </button>
                <Link href={`${base}/tunjangan-tetap`} className={btnOutline}>
                  Tunjangan Tetap
                </Link>
              </>
            }
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTab(t.key)}
                  className={`shrink-0 rounded-lg border px-4 py-1.5 text-[13px] ${
                    tab === t.key
                      ? "border-brand-500 bg-white font-semibold text-brand-700"
                      : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <select
                value={filter}
                onChange={(ev) => {
                  setFilter(ev.target.value as typeof filter);
                  setPage(1);
                }}
                className={`${inputClass} !w-auto`}
              >
                <option value="aktif">Aktif</option>
                <option value="nonaktif">Nonaktif</option>
                <option value="semua">Semua</option>
              </select>
              <div className="relative">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
                <input
                  value={query}
                  onChange={(ev) => {
                    setQuery(ev.target.value);
                    setPage(1);
                  }}
                  placeholder="Cari"
                  className={`${inputClass} !w-48 !pl-8`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13px]">
            <thead className="bg-zinc-50 text-xs font-semibold text-zinc-600">
              <tr>
                <th className="w-12 px-5 py-3">No.</th>
                <th className="px-3 py-3">Nama</th>
                {cols.map((c) => (
                  <th key={c.head} className="px-3 py-3">
                    {c.head}
                  </th>
                ))}
                <th className="w-12 px-3 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 && (
                <tr>
                  <td colSpan={cols.length + 3} className="py-14 text-center text-sm text-zinc-400">
                    {employees.length === 0 ? "Belum ada karyawan. Tambahkan yang pertama." : "Tidak ada data."}
                  </td>
                </tr>
              )}
              {rows.map((e, i) => (
                <tr key={e.id} className="hover:bg-zinc-50/60">
                  <td className="px-5 py-3 text-zinc-500">{(current - 1) * PER_PAGE + i + 1}</td>
                  <td className="px-3 py-3">
                    <Link href={`${base}/${e.id}`} className="flex items-center gap-2.5">
                      {e.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element -- signed URL sementara dari bucket privat
                        <img src={e.photo_url} alt={`Foto ${e.name}`} className="h-8 w-8 shrink-0 rounded-full object-cover" />
                      ) : (
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                          {e.name.slice(0, 2).toUpperCase()}
                        </span>
                      )}
                      <span>
                        <span className="font-medium text-brand-700 hover:underline">{e.name}</span>
                        {!e.setup_complete && (
                          <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                            Belum lengkap
                          </span>
                        )}
                        {!e.active && (
                          <span className="ml-2 rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] font-semibold text-zinc-500">
                            Nonaktif
                          </span>
                        )}
                        {e.has_pin && (
                          <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            PIN
                          </span>
                        )}
                      </span>
                    </Link>
                  </td>
                  {cols.map((c) => (
                    <td key={c.head} className="px-3 py-3 text-zinc-700">
                      {c.cell(e)}
                    </td>
                  ))}
                  <td className="relative px-3 py-3">
                    <button
                      type="button"
                      onClick={() => setRowMenu(rowMenu === e.id ? null : e.id)}
                      className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
                      aria-label="Aksi"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {rowMenu === e.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setRowMenu(null)} />
                        <div className="absolute right-3 top-10 z-20 w-44 overflow-hidden rounded-xl border border-zinc-200 bg-white py-1 shadow-lg">
                          <Link href={`${base}/${e.id}`} className="block px-4 py-2 text-[13px] hover:bg-zinc-50">
                            Lihat Detail
                          </Link>
                          <Link href={`${base}/${e.id}/setup/1`} className="block px-4 py-2 text-[13px] hover:bg-zinc-50">
                            {e.setup_complete ? "Ubah Data" : "Lengkapi Data"}
                          </Link>
                          {e.photo_url && (
                            <button
                              type="button"
                              className="block w-full px-4 py-2 text-left text-[13px] hover:bg-zinc-50"
                              onClick={() => {
                                setRowMenu(null);
                                if (confirm(`Hapus foto profil ${e.name}?`)) removeEmployeePhoto(businessId, e.id);
                              }}
                            >
                              Hapus Foto
                            </button>
                          )}
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-[13px] hover:bg-zinc-50"
                            onClick={() => {
                              setRowMenu(null);
                              setEmployeeActive(businessId, e.id, !e.active);
                            }}
                          >
                            {e.active ? "Nonaktifkan" : "Aktifkan"}
                          </button>
                          <button
                            type="button"
                            className="block w-full px-4 py-2 text-left text-[13px] text-red-600 hover:bg-red-50"
                            onClick={() => {
                              setRowMenu(null);
                              if (confirm(`Hapus ${e.name} dari daftar karyawan?`)) softDeleteEmployee(businessId, e.id);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 px-5 py-3 text-xs text-zinc-500">
          <span>
            {filtered.length === 0 ? 0 : (current - 1) * PER_PAGE + 1}–{Math.min(current * PER_PAGE, filtered.length)} dari{" "}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={current <= 1}
              onClick={() => setPage(current - 1)}
              className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-40"
              aria-label="Sebelumnya"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="px-2">
              {current} / {pages}
            </span>
            <button
              type="button"
              disabled={current >= pages}
              onClick={() => setPage(current + 1)}
              className="rounded-lg border border-zinc-200 p-1.5 hover:bg-zinc-50 disabled:opacity-40"
              aria-label="Berikutnya"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </Card>

      {quick && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold text-zinc-900">Tambah Cepat</h2>
            <p className="mb-4 text-xs text-zinc-400">
              Data minimum saja. Lengkapi profilnya nanti lewat menu Lengkapi Data.
            </p>
            <EmployeeForm action={boundCreate} submitLabel="Tambah Karyawan" onDone={() => setQuick(false)} />
          </div>
        </div>
      )}

      {showImport && (
        <ImportEmployeesModal businessId={businessId} onClose={() => setShowImport(false)} />
      )}
    </div>
  );
}
