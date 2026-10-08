"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./logout-button";

const NAV = [
  { key: "", label: "Ringkasan", icon: "🏠" },
  { key: "employees", label: "Karyawan", icon: "👥" },
  { key: "attendance", label: "Absensi", icon: "🤳" },
  { key: "shifts", label: "Jadwal Shift", icon: "🗓️" },
  { key: "leave-requests", label: "Cuti", icon: "🌴" },
  { key: "overtime", label: "Lembur", icon: "⏱️" },
  { key: "payroll", label: "Payroll", icon: "💰" },
  { key: "settings", label: "Pengaturan", icon: "⚙️" },
] as const;

export default function DashboardShell({
  businessId,
  businessName,
  userEmail,
  children,
}: {
  businessId: string;
  businessName: string;
  userEmail: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const base = `/business/${businessId}`;

  function href(key: string) {
    return key ? `${base}/${key}` : base;
  }

  function isActive(key: string) {
    const target = href(key);
    if (key === "") return pathname === base;
    return pathname === target || pathname.startsWith(`${target}/`);
  }

  const initial = (businessName || "?").charAt(0).toUpperCase();

  return (
    <div className="flex min-h-screen bg-zinc-50">
      {/* Sidebar — desktop (disembunyikan saat print, lihat payslip print view) */}
      <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-zinc-200 bg-white print:hidden">
        <div className="flex items-center gap-3 border-b border-zinc-100 px-5 py-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-xs font-bold text-white">
            {initial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-zinc-900">{businessName}</p>
            <p className="truncate text-[10px] text-zinc-400">{userEmail}</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={href(item.key)}
              className={`mb-1 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive(item.key)
                  ? "bg-brand-50 font-semibold text-brand-700"
                  : "text-zinc-600 hover:bg-zinc-50"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-zinc-100 px-3 py-3">
          <LogoutButton />
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile nav */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-zinc-200 bg-white px-4 py-3 md:hidden print:hidden">
          {NAV.map((item) => (
            <Link
              key={item.key}
              href={href(item.key)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                isActive(item.key) ? "bg-brand-600 text-white" : "bg-zinc-100 text-zinc-600"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </div>

        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl px-4 py-5 sm:px-6 sm:py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
