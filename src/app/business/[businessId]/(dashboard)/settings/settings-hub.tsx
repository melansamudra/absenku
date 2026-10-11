"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Banknote,
  Building2,
  CalendarClock,
  CalendarDays,
  Clock,
  FileText,
  Gauge,
  HandCoins,
  History,
  Layers,
  Lock,
  MapPin,
  Megaphone,
  Receipt,
  Search,
  Settings2,
  Timer,
  Umbrella,
  Wallet,
  type LucideIcon,
} from "lucide-react";

type Item = { title: string; desc: string; href: string; icon: LucideIcon };
type Category = { key: string; label: string; icon: LucideIcon; intro: string; groups: { name: string; items: Item[] }[] };

// Susunan kategori mengikuti Pengaturan GajiHub (lihat docs/gajihub-spec.md bagian 8).
const CATEGORIES: Category[] = [
  {
    key: "perusahaan",
    label: "Perusahaan",
    icon: Building2,
    intro: "Atur data, alur, dan pengaturan umum perusahaan Anda.",
    groups: [
      {
        name: "Identitas",
        items: [
          { title: "Data Bisnis & Link", desc: "Nama, alamat, link absen, cuti, dan portal karyawan", href: "settings/general", icon: Building2 },
          { title: "Organisasi, Jabatan & Pangkat", desc: "Kelola data master untuk profil karyawan", href: "settings/master", icon: Layers },
        ],
      },
      {
        name: "Data sistem",
        items: [
          { title: "Tanggal Merah", desc: "Libur tambahan di luar Sabtu/Minggu", href: "settings/holidays", icon: CalendarDays },
          { title: "Log Aktivitas", desc: "Riwayat aksi sensitif dan perubahan data", href: "activity-log", icon: History },
        ],
      },
      {
        name: "Lainnya",
        items: [{ title: "Papan Informasi", desc: "Pengumuman untuk karyawan di portal", href: "announcements", icon: Megaphone }],
      },
    ],
  },
  {
    key: "payroll",
    label: "Payroll",
    icon: Banknote,
    intro: "Atur penggajian dan keuangan karyawan sesuai kebijakan perusahaan.",
    groups: [
      {
        name: "Penggajian",
        items: [
          { title: "Aturan Payroll", desc: "PPh 21, BPJS, dan potongan izin", href: "settings/general", icon: Settings2 },
          { title: "Tunjangan Tetap", desc: "Tunjangan rutin per karyawan", href: "employees/tunjangan-tetap", icon: HandCoins },
          { title: "Potongan Telat Bertingkat", desc: "Potongan berdasarkan menit keterlambatan", href: "settings/late-tiers", icon: Gauge },
        ],
      },
      {
        name: "Keuangan karyawan",
        items: [
          { title: "Kasbon", desc: "Pinjaman gaji dan cicilan", href: "payroll/kasbon", icon: Wallet },
          { title: "Pinjaman Pribadi", desc: "Pinjaman karyawan dan potongan", href: "payroll/pinjaman", icon: HandCoins },
          { title: "Reimbursement", desc: "Klaim pengeluaran karyawan", href: "reimbursements", icon: Receipt },
        ],
      },
    ],
  },
  {
    key: "kehadiran",
    label: "Kehadiran",
    icon: Clock,
    intro: "Atur jadwal kerja dan presensi karyawan Anda.",
    groups: [
      {
        name: "Jadwal & waktu kerja",
        items: [
          { title: "Jam & Hari Kerja", desc: "Jam masuk/pulang dan hari kerja per minggu", href: "settings/general", icon: Clock },
          { title: "Jadwal Shift", desc: "Template shift dan penjadwalan karyawan", href: "shifts", icon: CalendarClock },
          { title: "Lembur", desc: "Aturan dan persetujuan lembur", href: "overtime", icon: Timer },
        ],
      },
      {
        name: "Presensi & lokasi",
        items: [
          { title: "Lokasi Kantor", desc: "Titik utama dan cabang untuk absen selfie", href: "settings/locations", icon: MapPin },
          { title: "Keamanan Absen", desc: "PIN absen dan radius lokasi", href: "settings/general", icon: Lock },
          { title: "Approval Presensi", desc: "Setujui atau tolak presensi karyawan", href: "attendance/approval", icon: FileText },
        ],
      },
    ],
  },
  {
    key: "cuti",
    label: "Cuti",
    icon: Umbrella,
    intro: "Atur kebijakan cuti dan perizinan karyawan Anda.",
    groups: [
      {
        name: "Cuti",
        items: [
          { title: "Jenis Cuti", desc: "Cuti tahunan, sakit, izin, dan lainnya beserta kuotanya", href: "leave-types", icon: Umbrella },
          { title: "Saldo Cuti", desc: "Sisa cuti per karyawan tahun ini", href: "leave-requests/balance", icon: Gauge },
          { title: "Pengajuan Cuti", desc: "Setujui atau tolak pengajuan karyawan", href: "leave-requests", icon: FileText },
        ],
      },
    ],
  },
];

export default function SettingsHub({ businessId }: { businessId: string }) {
  const [active, setActive] = useState(CATEGORIES[0].key);
  const [query, setQuery] = useState("");
  const base = `/business/${businessId}`;
  const q = query.trim().toLowerCase();

  const category = CATEGORIES.find((c) => c.key === active) ?? CATEGORIES[0];
  const searchResults = q
    ? CATEGORIES.flatMap((c) => c.groups.flatMap((g) => g.items.map((i) => ({ ...i, category: c.label })))).filter(
        (i) => `${i.title} ${i.desc}`.toLowerCase().includes(q),
      )
    : null;

  return (
    <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 p-5 sm:p-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Pengaturan</h1>
          <p className="mt-0.5 text-sm text-zinc-500">Kelola konfigurasi dan preferensi sistem aplikasi</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-300" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari pengaturan"
            className="w-full rounded-lg border border-zinc-200 bg-white py-2 pl-8 pr-3 text-[13px] focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="grid md:grid-cols-[220px_1fr]">
        <nav className="flex gap-1 overflow-x-auto border-b border-zinc-100 p-3 md:flex-col md:border-b-0 md:border-r">
          {CATEGORIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setActive(c.key);
                setQuery("");
              }}
              className={`flex shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-[13px] transition-colors ${
                !q && active === c.key ? "bg-brand-600 font-semibold text-white" : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <c.icon size={17} className="shrink-0" />
              {c.label}
            </button>
          ))}
        </nav>

        <div className="p-5 sm:p-6">
          {searchResults ? (
            <>
              <h2 className="mb-4 text-lg font-semibold text-zinc-900">Hasil pencarian</h2>
              {searchResults.length === 0 ? (
                <p className="text-sm text-zinc-400">Tidak ada pengaturan yang cocok.</p>
              ) : (
                <ItemGrid items={searchResults} base={base} />
              )}
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-zinc-900">{category.label}</h2>
              <p className="mb-5 mt-0.5 text-sm text-zinc-500">{category.intro}</p>
              <div className="space-y-6">
                {category.groups.map((g) => (
                  <div key={g.name}>
                    <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">{g.name}</p>
                    <ItemGrid items={g.items} base={base} />
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function ItemGrid({ items, base }: { items: (Item & { category?: string })[]; base: string }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map((i) => (
        <Link
          key={`${i.href}-${i.title}`}
          href={`${base}/${i.href}`}
          className="group flex items-start gap-3 rounded-xl border border-zinc-100 p-4 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100">
            <i.icon size={19} />
          </span>
          <span className="min-w-0">
            <span className="block text-[13px] font-semibold text-zinc-900">{i.title}</span>
            <span className="mt-0.5 block text-xs text-zinc-500">{i.desc}</span>
            {i.category && <span className="mt-1 block text-[11px] text-zinc-400">{i.category}</span>}
          </span>
        </Link>
      ))}
    </div>
  );
}
