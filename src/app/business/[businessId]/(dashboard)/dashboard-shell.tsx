"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Banknote,
  Bell,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarRange,
  ChevronDown,
  ClipboardList,
  Target,
  ClipboardCheck,
  FileBarChart,
ChevronLeft,
  House,
  ListChecks,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  Receipt,
  Settings,
  Timer,
  Umbrella,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type NavItem = { key: string; label: string; icon: LucideIcon };
type NavEntry = NavItem | { group: string; icon: LucideIcon; items: NavItem[] };

// Menu dikelompokkan seperti aplikasi HR pada umumnya; `key` = segmen URL.
const NAV: NavEntry[] = [
  { key: "", label: "Beranda", icon: House },
  { key: "employees", label: "Karyawan", icon: Users },
  {
    group: "Kehadiran",
    icon: CalendarCheck,
    items: [
      { key: "attendance", label: "Presensi", icon: CalendarCheck },
      { key: "attendance/approval", label: "Approval Presensi", icon: ClipboardCheck },
      { key: "shifts", label: "Jadwal Shift", icon: CalendarClock },
      { key: "leave-requests", label: "Izin & Cuti", icon: Umbrella },
      { key: "overtime", label: "Lembur", icon: Timer },
    ],
  },
  {
    group: "Payroll",
    icon: Banknote,
    items: [
      { key: "payroll", label: "Payroll", icon: Banknote },
      { key: "reimbursements", label: "Reimbursement", icon: Receipt },
    ],
  },
  {
    group: "Komunikasi",
    icon: Megaphone,
    items: [
      { key: "announcements", label: "Papan Informasi", icon: Megaphone },
      { key: "tasks", label: "Tugas & Kegiatan", icon: ListChecks },
      { key: "letters", label: "Surat SP/SK", icon: Mail },
    ],
  },
  {
    group: "KPI",
    icon: Target,
    items: [
      { key: "kpi/forms", label: "Formulir", icon: ClipboardList },
      { key: "kpi/schedules", label: "Jadwal", icon: CalendarRange },
      { key: "kpi/reviews", label: "Evaluasi", icon: ListChecks },
    ],
  },
  { key: "report", label: "Laporan", icon: FileBarChart },
  { key: "settings", label: "Pengaturan", icon: Settings },
];

const isGroup = (e: NavEntry): e is Extract<NavEntry, { group: string }> => "group" in e;
const ALL_ITEMS: NavItem[] = NAV.flatMap((e) => (isGroup(e) ? e.items : [e]));

// Menu yang punya badge "menunggu" dan nama yang tampil di lonceng notifikasi.
const NOTIFICATION_LABEL: Record<string, string> = {
  "attendance/approval": "presensi menunggu approval",
  "leave-requests": "pengajuan cuti",
  overtime: "pengajuan lembur",
  reimbursements: "klaim reimbursement",
};

export default function DashboardShell({
  businessId,
  businessName,
  userEmail,
  badges = {},
  children,
}: {
  businessId: string;
  businessName: string;
  userEmail: string;
  /** Jumlah permintaan menunggu per menu (key menu → angka). 0 = tanpa badge. */
  badges?: Record<string, number>;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/business/${businessId}`;
  const [drawer, setDrawer] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [menu, setMenu] = useState<"bell" | "user" | null>(null);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [loggingOut, setLoggingOut] = useState(false);
  const topbarRef = useRef<HTMLDivElement>(null);

  const href = (key: string) => (key ? `${base}/${key}` : base);
  // Hanya menu yang paling spesifik yang menyala (mis. attendance/approval, bukan attendance).
  let bestKey: string | null = null;
  for (const item of ALL_ITEMS) {
    const target = href(item.key);
    const hit = item.key === "" ? pathname === base : pathname === target || pathname.startsWith(`${target}/`);
    if (hit && (bestKey === null || item.key.length > bestKey.length)) bestKey = item.key;
  }
  const isActive = (key: string) => key === bestKey;
  const groupActive = (g: Extract<NavEntry, { group: string }>) => g.items.some((i) => isActive(i.key));
  const groupBadge = (g: Extract<NavEntry, { group: string }>) => g.items.reduce((t, i) => t + (badges[i.key] ?? 0), 0);

  const toggleCollapsed = () => setCollapsed((v) => !v);

  // Pindah halaman: tutup drawer & menu (disesuaikan saat render, bukan di effect).
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setDrawer(false);
    setMenu(null);
  }
  // Klik di luar top bar menutup menu notifikasi/akun.
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (topbarRef.current && !topbarRef.current.contains(e.target as Node)) setMenu(null);
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  async function logout() {
    setLoggingOut(true);
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  const pendingEntries = Object.entries(NOTIFICATION_LABEL)
    .map(([key, label]) => ({ key, label, count: badges[key] ?? 0 }))
    .filter((e) => e.count > 0);
  const pendingTotal = pendingEntries.reduce((t, e) => t + e.count, 0);

  const currentLabel = ALL_ITEMS.find((i) => isActive(i.key) && i.key !== "")?.label ?? null;
  const initial = (userEmail || businessName || "?").charAt(0).toUpperCase();

  function renderNav(compact: boolean) {
    return (
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map((entry) => {
          if (!isGroup(entry)) {
            const active = isActive(entry.key);
            return (
              <Link
                key={entry.key}
                href={href(entry.key)}
                title={compact ? entry.label : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active ? "bg-brand-50 font-semibold text-brand-700" : "text-zinc-600 hover:bg-zinc-50"
                } ${compact ? "justify-center" : ""}`}
              >
                <entry.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                {!compact && <span className="flex-1">{entry.label}</span>}
                {!compact && (badges[entry.key] ?? 0) > 0 && <Badge n={badges[entry.key]} />}
              </Link>
            );
          }
          const active = groupActive(entry);
          const open = compact ? false : (openGroups[entry.group] ?? active);
          return (
            <div key={entry.group}>
              <button
                type="button"
                title={compact ? entry.group : undefined}
                onClick={() => (compact ? (toggleCollapsed(), setOpenGroups((s) => ({ ...s, [entry.group]: true }))) : setOpenGroups((s) => ({ ...s, [entry.group]: !open })))}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                  active && !open ? "bg-brand-50 font-semibold text-brand-700" : "text-zinc-600 hover:bg-zinc-50"
                } ${compact ? "justify-center" : ""}`}
              >
                <entry.icon className="h-[18px] w-[18px] shrink-0" strokeWidth={active ? 2.3 : 1.9} aria-hidden="true" />
                {!compact && (
                  <>
                    <span className="flex-1 text-left">{entry.group}</span>
                    {!open && groupBadge(entry) > 0 && <Badge n={groupBadge(entry)} />}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
                  </>
                )}
              </button>
              {open && (
                <div className="ml-4 mt-0.5 space-y-0.5 border-l border-zinc-100 pl-3">
                  {entry.items.map((item) => {
                    const itemActive = isActive(item.key);
                    return (
                      <Link
                        key={item.key}
                        href={href(item.key)}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          itemActive ? "bg-brand-50 font-semibold text-brand-700" : "text-zinc-600 hover:bg-zinc-50"
                        }`}
                      >
                        <item.icon className="h-4 w-4 shrink-0" strokeWidth={itemActive ? 2.3 : 1.9} aria-hidden="true" />
                        <span className="flex-1">{item.label}</span>
                        {(badges[item.key] ?? 0) > 0 && <Badge n={badges[item.key]} />}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    );
  }

  const logo = (
    <Link href={base} className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">A</span>
      <span className="text-lg font-extrabold tracking-tight text-brand-700">ABSENKU</span>
    </Link>
  );

  return (
    <div className="admin-scale flex min-h-screen bg-zinc-50">
      {/* Sidebar desktop */}
      <aside className={`hidden shrink-0 flex-col border-r border-zinc-200 bg-white transition-[width] md:flex print:hidden ${collapsed ? "w-[72px]" : "w-64"}`}>
        <div className={`flex h-16 items-center border-b border-zinc-100 ${collapsed ? "justify-center px-2" : "px-5"}`}>
          {collapsed ? (
            <Link href={base} className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white" aria-label="Beranda">
              A
            </Link>
          ) : (
            logo
          )}
        </div>
        {renderNav(collapsed)}
        <button
          type="button"
          onClick={toggleCollapsed}
          aria-label={collapsed ? "Perbesar menu" : "Kecilkan menu"}
          className="flex h-12 items-center justify-center border-t border-zinc-100 text-zinc-400 hover:text-zinc-700"
        >
          <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} aria-hidden="true" />
        </button>
      </aside>

      {/* Drawer mobile */}
      {drawer && (
        <div className="fixed inset-0 z-40 md:hidden print:hidden">
          <button type="button" aria-label="Tutup menu" className="absolute inset-0 bg-zinc-900/40" onClick={() => setDrawer(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-zinc-100 px-5">
              {logo}
              <button type="button" aria-label="Tutup" onClick={() => setDrawer(false)} className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100">
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            {renderNav(false)}
          </aside>
        </div>
      )}

      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        {/* Top bar */}
        <header ref={topbarRef} className="relative z-30 flex h-16 shrink-0 items-center justify-between gap-3 border-b border-zinc-200 bg-white px-4 text-zinc-700 sm:px-6 print:hidden">
          <div className="flex min-w-0 items-center gap-3">
            <button type="button" aria-label="Buka menu" onClick={() => setDrawer(true)} className="rounded-lg p-1.5 hover:bg-zinc-100 md:hidden">
              <Menu className="h-6 w-6" aria-hidden="true" />
            </button>
            <Building2 className="hidden h-5 w-5 shrink-0 text-brand-500 sm:block" aria-hidden="true" />
            <span className="truncate text-sm font-bold tracking-wide text-zinc-800">{businessName}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <div className="relative">
              <button
                type="button"
                aria-label="Notifikasi"
                aria-expanded={menu === "bell"}
                onClick={() => setMenu(menu === "bell" ? null : "bell")}
                className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              >
                <Bell className="h-5 w-5" aria-hidden="true" />
                {pendingTotal > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold leading-none text-white ring-2 ring-white">
                    {pendingTotal}
                  </span>
                )}
              </button>
              {menu === "bell" && (
                <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-2xl bg-white text-zinc-800 shadow-xl ring-1 ring-zinc-200">
                  <p className="border-b border-zinc-100 px-4 py-3 text-sm font-semibold">Menunggu persetujuan</p>
                  {pendingEntries.length === 0 ? (
                    <p className="px-4 py-5 text-center text-xs text-zinc-500">Tidak ada pengajuan yang menunggu.</p>
                  ) : (
                    pendingEntries.map((e) => (
                      <Link key={e.key} href={href(e.key)} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-zinc-50">
                        <span>
                          <span className="font-semibold">{e.count}</span> {e.label}
                        </span>
                        <span className="text-xs text-brand-600">Buka →</span>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-label="Menu akun"
                aria-expanded={menu === "user"}
                onClick={() => setMenu(menu === "user" ? null : "user")}
                className="flex h-10 items-center gap-1 rounded-xl bg-zinc-100 pl-1.5 pr-2 text-zinc-600 hover:bg-zinc-200"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">{initial}</span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </button>
              {menu === "user" && (
                <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl bg-white text-zinc-800 shadow-xl ring-1 ring-zinc-200">
                  <div className="border-b border-zinc-100 px-4 py-3">
                    <p className="text-[12px] text-zinc-500">Masuk sebagai</p>
                    <p className="truncate text-sm font-semibold">{userEmail}</p>
                  </div>
                  <Link href={href("settings")} className="flex items-center gap-2.5 px-4 py-3 text-sm hover:bg-zinc-50">
                    <Settings className="h-4 w-4 text-zinc-500" aria-hidden="true" /> Pengaturan
                  </Link>
                  <button type="button" onClick={logout} disabled={loggingOut} className="flex w-full items-center gap-2.5 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-60">
                    <LogOut className="h-4 w-4" aria-hidden="true" /> {loggingOut ? "Keluar…" : "Keluar"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-2.5 text-xs text-zinc-500 sm:px-6 print:hidden">
          <Link href={base} className="hover:text-zinc-800">
            Home
          </Link>
          {currentLabel && (
            <>
              <span aria-hidden="true">›</span>
              <span className="font-semibold text-zinc-800">{currentLabel}</span>
            </>
          )}
        </nav>

        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}

function Badge({ n }: { n: number }) {
  return (
    <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[11px] font-bold leading-none text-white" aria-label={`${n} menunggu`}>
      {n}
    </span>
  );
}
