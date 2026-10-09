import Link from "next/link";
import type { LucideIcon } from "lucide-react";

// Komponen tampilan Portal Karyawan — mobile-first, dipakai halaman utama
// portal & detail slip. Server component murni (tanpa state).

export function fmtRupiah(v: number) {
  return `Rp ${Math.round(v).toLocaleString("id-ID")}`;
}

function utcDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

export function fmtDate(dateStr: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) {
  return utcDate(dateStr).toLocaleDateString("id-ID", { ...opts, timeZone: "UTC" });
}

/** "Oktober 2026" kalau periode = satu bulan penuh, selain itu "1 Okt – 15 Okt 2026". */
export function fmtPeriod(start: string, end: string) {
  const s = utcDate(start);
  const e = utcDate(end);
  const lastDayOfMonth = new Date(Date.UTC(e.getUTCFullYear(), e.getUTCMonth() + 1, 0)).getUTCDate();
  if (
    s.getUTCDate() === 1 &&
    e.getUTCDate() === lastDayOfMonth &&
    s.getUTCMonth() === e.getUTCMonth() &&
    s.getUTCFullYear() === e.getUTCFullYear()
  ) {
    return fmtDate(start, { month: "long", year: "numeric" });
  }
  return `${fmtDate(start, { day: "numeric", month: "short" })} – ${fmtDate(end)}`;
}

export function Card({
  title,
  icon: Icon,
  action,
  children,
}: {
  title?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white p-5 shadow-[0_1px_3px_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)]">
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-zinc-900">
            {Icon && (
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-portal-50 text-portal-600">
                <Icon className="h-4 w-4" strokeWidth={2.25} aria-hidden="true" />
              </span>
            )}
            {title}
          </h2>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Badge({ tone, children }: { tone: "green" | "amber" | "red" | "zinc"; children: React.ReactNode }) {
  const tones = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
    amber: "bg-amber-50 text-amber-700 ring-amber-600/15",
    red: "bg-red-50 text-red-600 ring-red-600/15",
    zinc: "bg-zinc-100 text-zinc-600 ring-zinc-500/10",
  };
  return (
    <span className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyState({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl bg-zinc-50 px-4 py-6 text-center">
      <Icon className="h-6 w-6 text-zinc-300" aria-hidden="true" />
      <p className="text-sm text-zinc-500">{text}</p>
    </div>
  );
}

export function Hero({
  businessName,
  title,
  subtitle,
  right,
  children,
}: {
  businessName: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <header className="relative overflow-hidden rounded-b-[2rem] bg-gradient-to-br from-portal-600 via-portal-700 to-portal-900 px-5 pb-8 pt-6 text-white">
      <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-10 h-48 w-48 rounded-full bg-portal-300/20 blur-2xl" />
      <div className="relative mx-auto max-w-md">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-sm font-bold ring-1 ring-white/20">
              A
            </span>
            <span className="truncate text-sm font-medium text-white/80">{businessName}</span>
          </div>
          {right}
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-white/70">{subtitle}</p>}
        {children}
      </div>
    </header>
  );
}

export function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex flex-col items-center gap-1.5 rounded-2xl bg-white/10 px-2 py-3 text-center ring-1 ring-white/15 backdrop-blur transition-colors hover:bg-white/20"
    >
      <Icon className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
      <span className="text-[11px] font-medium leading-tight">{label}</span>
    </Link>
  );
}

export function BottomNav({
  items,
  active,
}: {
  items: { href: string; label: string; icon: LucideIcon; key: string }[];
  active: string;
}) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-zinc-200/70 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <div className="mx-auto flex max-w-md">
        {items.map(({ href, label, icon: Icon, key }) => {
          const isActive = key === active;
          return (
            <Link
              key={key}
              href={href}
              prefetch={false}
              aria-current={isActive ? "page" : undefined}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                isActive ? "text-portal-600" : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${isActive ? "bg-portal-50" : ""}`}>
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 1.9} aria-hidden="true" />
              </span>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
