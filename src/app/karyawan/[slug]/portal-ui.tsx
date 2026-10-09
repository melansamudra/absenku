import Link from "next/link";
import { ChevronLeft, FileQuestion, Plus, type LucideIcon } from "lucide-react";

// Komponen tampilan Portal Karyawan gaya aplikasi mobile: header gradasi biru,
// tombol kembali, kartu menu. Server component murni.

export function PortalHeader({
  title,
  backHref,
  plusHref,
  tabs,
}: {
  title: string;
  backHref: string;
  plusHref?: string;
  tabs?: { href: string; label: string; active: boolean }[];
}) {
  return (
    <header className="bg-gradient-to-b from-portal-300 to-portal-800 text-white">
      <div className="mx-auto flex h-[72px] max-w-md items-center justify-between px-4">
        <Link
          href={backHref}
          prefetch={false}
          aria-label="Kembali"
          className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ChevronLeft className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
        </Link>
        <h1 className="min-w-0 flex-1 truncate px-2 text-center text-lg font-bold">{title}</h1>
        {plusHref ? (
          <Link
            href={plusHref}
            prefetch={false}
            aria-label="Tambah"
            className="flex h-10 w-10 items-center justify-center"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-portal-800">
              <Plus className="h-5 w-5" strokeWidth={2.75} aria-hidden="true" />
            </span>
          </Link>
        ) : (
          <span className="h-10 w-10" />
        )}
      </div>
      {tabs && (
        <nav className="mx-auto flex max-w-md overflow-x-auto">
          {tabs.map((t) => (
            <Link
              key={t.label}
              href={t.href}
              prefetch={false}
              aria-current={t.active ? "page" : undefined}
              className={`flex-1 shrink-0 whitespace-nowrap px-4 py-3 text-center text-sm ${
                t.active ? "bg-white/35 font-bold" : "font-medium text-white/90"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function PortalEmpty({ text = "Data tidak ditemukan!" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <span className="flex h-28 w-28 items-center justify-center rounded-full bg-portal-100">
        <FileQuestion className="h-14 w-14 text-portal-500" strokeWidth={1.5} aria-hidden="true" />
      </span>
      <p className="text-lg font-bold text-portal-800">{text}</p>
    </div>
  );
}

export function PortalCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] ${className}`}>
      {children}
    </section>
  );
}

export function PortalSectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-center text-base font-bold text-portal-800">{children}</h2>;
}

// Kartu menu besar di beranda (ikon dalam lingkaran + label).
export function MenuCard({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-5 shadow-[0_1px_3px_rgba(15,23,42,0.06)] active:bg-portal-50"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-portal-100 text-portal-800">
        <Icon className="h-6 w-6" strokeWidth={1.9} aria-hidden="true" />
      </span>
      <span className="text-base text-portal-800">{label}</span>
    </Link>
  );
}

// Kotak menu kecil di halaman "Lainnya".
export function MenuTile({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link href={href} prefetch={false} className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-portal-800 shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <Icon className="h-8 w-8" strokeWidth={1.7} aria-hidden="true" />
      </span>
      <span className="text-[13px] leading-tight text-portal-800">{label}</span>
    </Link>
  );
}

export function StatCard({ value, label, className }: { value: number | string; label: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${className}`}>
      <span className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/15" />
      <span className="pointer-events-none absolute -right-2 top-2 h-16 w-16 rounded-full bg-white/10" />
      <p className="relative text-3xl font-medium tabular-nums">{value}</p>
      <p className="relative mt-1 text-sm leading-tight">{label}</p>
    </div>
  );
}
