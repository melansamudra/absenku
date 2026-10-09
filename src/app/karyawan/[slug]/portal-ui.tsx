import Link from "next/link";
import { Plus, type LucideIcon } from "lucide-react";
import BackButton from "./back-button";

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
        <BackButton href={backHref} />
        <h1 className="min-w-0 flex-1 truncate px-2 text-center text-base font-bold">{title}</h1>
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

// Ilustrasi "data tidak ditemukan": laptop + awan silang, server, gir, dan
// berkas oranye berlogo tanya.
export function PortalEmpty({ text = "Data tidak ditemukan!" }: { text?: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-14">
      <svg viewBox="0 0 300 210" className="w-64" role="img" aria-label="Data tidak ditemukan">
        <ellipse cx="150" cy="188" rx="140" ry="12" fill="#e8f1fb" />
        {/* server */}
        <rect x="178" y="48" width="92" height="132" rx="10" fill="#1f5683" />
        {[0, 1, 2, 3].map((i) => (
          <g key={i}>
            <rect x="186" y={58 + i * 30} width="76" height="22" rx="4" fill="#fff" />
            <rect x="192" y={65 + i * 30} width="10" height="3" rx="1.5" fill="#1f5683" />
            <rect x="206" y={65 + i * 30} width="30" height="3" rx="1.5" fill="#c4d8ee" />
            <rect x="192" y={71 + i * 30} width="44" height="3" rx="1.5" fill="#c4d8ee" />
          </g>
        ))}
        <rect x="196" y="36" width="60" height="14" rx="7" fill="#c4d8ee" />
        {/* laptop */}
        <rect x="42" y="82" width="122" height="84" rx="6" fill="#5b84b1" />
        <rect x="49" y="89" width="108" height="70" rx="3" fill="#c9dcf2" />
        <path d="M30 168h146l-6 10H36z" fill="#c4d8ee" />
        <path d="M82 134a14 14 0 0 1 4-27 20 20 0 0 1 38 4 14 14 0 0 1 2 23z" fill="#fff" />
        <path d="M97 114l18 18m0-18l-18 18" stroke="#4f80ad" strokeWidth="5" strokeLinecap="round" />
        {/* mata dicoret */}
        <path d="M14 64c14-18 40-18 54 0-14 18-40 18-54 0z" fill="none" stroke="#9db9d9" strokeWidth="3" />
        <circle cx="41" cy="64" r="8" fill="#9db9d9" />
        <path d="M18 84L62 44" stroke="#1f5683" strokeWidth="3" strokeLinecap="round" />
        {/* gir */}
        <circle cx="132" cy="60" r="15" fill="none" stroke="#1f5683" strokeWidth="8" strokeDasharray="5 4.7" />
        <circle cx="132" cy="60" r="10" fill="#1f5683" />
        <circle cx="132" cy="60" r="4" fill="#fff" />
        <circle cx="100" cy="82" r="10" fill="none" stroke="#4f80ad" strokeWidth="6" strokeDasharray="4 3.1" />
        <circle cx="100" cy="82" r="7" fill="#4f80ad" />
        <circle cx="100" cy="82" r="3" fill="#fff" />
        {/* awan kecil + tanda tambah */}
        <path d="M84 40a8 8 0 0 1 2-15 11 11 0 0 1 21 2 8 8 0 0 1 1 13z" fill="#c4d8ee" />
        <path d="M92 31l8 8m0-8l-8 8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        <path d="M70 70v8m-4-4h8M148 96v8m-4-4h8" stroke="#9db9d9" strokeWidth="2.5" strokeLinecap="round" />
        {/* berkas oranye */}
        <path d="M150 128h40l12 12v46h-52z" fill="#f9a94a" />
        <path d="M190 128l12 12h-12z" fill="#fcd48e" />
        <text x="176" y="176" textAnchor="middle" fontSize="38" fontWeight="700" fill="#fff" fontFamily="sans-serif">
          ?
        </text>
      </svg>
      <p className="text-sm font-bold text-portal-800">{text}</p>
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
  return <h2 className="text-center text-sm font-bold text-portal-800">{children}</h2>;
}

// Ikon dua warna: ikon utama biru tua + lencana kecil oranye (seperti aplikasi
// referensi).
function DuoIcon({
  icon: Icon,
  accent: Accent,
  size,
}: {
  icon: LucideIcon;
  accent?: LucideIcon;
  size: "md" | "lg";
}) {
  const main = size === "lg" ? "h-8 w-8" : "h-6 w-6";
  const badge = size === "lg" ? "h-4 w-4 -right-1 -bottom-1" : "h-3.5 w-3.5 -right-1 -bottom-0.5";
  return (
    <span className="relative inline-flex">
      <Icon className={`${main} text-portal-800`} strokeWidth={1.6} aria-hidden="true" />
      {Accent && (
        <Accent
          className={`absolute ${badge} rounded-full bg-white text-[#f5a03a]`}
          strokeWidth={2.75}
          aria-hidden="true"
        />
      )}
    </span>
  );
}

// Kartu menu besar di beranda (ikon dalam lingkaran + label).
export function MenuCard({
  href,
  icon,
  accent,
  label,
}: {
  href: string;
  icon: LucideIcon;
  accent?: LucideIcon;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-2xl bg-white px-4 py-4 shadow-[0_1px_3px_rgba(15,23,42,0.06)] active:bg-portal-50"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-portal-100">
        <DuoIcon icon={icon} accent={accent} size="md" />
      </span>
      <span className="text-sm text-portal-800">{label}</span>
    </Link>
  );
}

// Kotak menu kecil di halaman "Lainnya".
export function MenuTile({
  href,
  icon,
  accent,
  label,
}: {
  href: string;
  icon: LucideIcon;
  accent?: LucideIcon;
  label: string;
}) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)]">
        <DuoIcon icon={icon} accent={accent} size="lg" />
      </span>
      <span className="text-xs leading-tight text-portal-800">{label}</span>
    </Link>
  );
}

export function StatCard({ value, label, className }: { value: number | string; label: string; className: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-4 text-white ${className}`}>
      <span className="pointer-events-none absolute -right-6 -top-8 h-20 w-20 rounded-full bg-white/15" />
      <span className="pointer-events-none absolute -right-2 top-2 h-16 w-16 rounded-full bg-white/10" />
      <p className="relative text-xl font-medium tabular-nums">{value}</p>
      <p className="relative mt-1 text-sm leading-tight">{label}</p>
    </div>
  );
}
