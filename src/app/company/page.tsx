import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarCheck,
  Link2,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Zap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Cashimpact — Aplikasi Digital untuk Bisnis",
  description:
    "Cashimpact, bagian dari Createimpact.id, menghadirkan rangkaian aplikasi digital untuk operasional bisnis Anda.",
};

const FLOATING_PILLS = [
  { icon: "🤳", label: "Absen Selfie", className: "left-[6%] top-[22%]", delay: "0s" },
  { icon: "💰", label: "Payroll Otomatis", className: "right-[8%] top-[16%]", delay: "1.2s" },
  { icon: "🧾", label: "Kasir Digital", className: "left-[10%] bottom-[14%]", delay: "0.6s" },
  { icon: "👥", label: "Data Karyawan", className: "right-[10%] bottom-[20%]", delay: "1.8s" },
];

const VALUE_PROPS = [
  {
    icon: Zap,
    title: "Laporan Satu Klik",
    description:
      "Rekap absensi, slip gaji, sampai laporan PPh 21 & BPJS otomatis siap pakai — tanpa rekap manual.",
  },
  {
    icon: ShieldCheck,
    title: "Aman & Sesuai Aturan",
    description:
      "Perhitungan payroll, PPh 21, dan BPJS mengikuti aturan yang berlaku untuk bisnis di Indonesia.",
  },
  {
    icon: Link2,
    title: "Tanpa Install Aplikasi",
    description:
      "Karyawan absen dan cek slip gaji lewat portal khusus miliknya sendiri di browser — tidak perlu download apa-apa.",
  },
];

const products = [
  {
    name: "HR Cashimpact",
    tagline: "Absensi, SDM & Payroll",
    description:
      "Absensi selfie, data karyawan, dan payroll — dalam satu aplikasi untuk bisnis Anda.",
    tags: ["Absen Selfie + GPS", "Payroll Otomatis", "Laporan Satu Klik", "Portal Karyawan"],
    href: "https://hr.cashimpact.id",
    cta: "Buka Aplikasi",
    icon: CalendarCheck,
    accent: "from-brand-500 to-brand-700 shadow-brand-600/25",
    available: true,
  },
  {
    name: "PosCash",
    tagline: "Kasir Digital",
    description: "Aplikasi kasir digital untuk toko dan bisnis Anda. Segera pindah ke sini.",
    tags: [],
    href: null,
    cta: "Segera Hadir",
    icon: ShoppingCart,
    accent: "from-zinc-300 to-zinc-400 shadow-zinc-400/20",
    available: false,
  },
];

export default function CompanyPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-600 to-brand-400">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-amber-300/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-brand-900/30 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-white/10 blur-3xl"
        />

        {/* Nav */}
        <nav className="relative mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-sm font-extrabold text-brand-700">
              C
            </span>
            <span className="text-sm font-bold tracking-tight text-white">Cashimpact</span>
          </div>
          <a
            href="https://createimpact.id"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs font-medium text-white/70 transition-colors hover:text-white"
          >
            Createimpact.id
            <ArrowUpRight size={13} />
          </a>
        </nav>

        {/* Floating feature pills — disembunyikan di layar kecil */}
        <div aria-hidden className="pointer-events-none absolute inset-0 hidden lg:block">
          {FLOATING_PILLS.map((pill) => (
            <div
              key={pill.label}
              className={`animate-float absolute flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/90 backdrop-blur-md ${pill.className}`}
              style={{ animationDelay: pill.delay }}
            >
              <span className="text-sm leading-none">{pill.icon}</span>
              {pill.label}
            </div>
          ))}
        </div>

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 pb-28 pt-6 text-center sm:pb-36 sm:pt-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Sparkles size={13} />
            Bagian dari Createimpact.id
          </span>
          <h1 className="bg-gradient-to-b from-white to-brand-100 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-7xl">
            Cashimpact
          </h1>
          <p className="max-w-lg text-base text-brand-50/90 sm:text-lg">
            Rangkaian aplikasi digital yang bikin operasional bisnis Anda lebih
            ringkas — dari absensi, SDM, payroll, hingga kasir.
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="https://hr.cashimpact.id/signup"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-brand-700 shadow-lg shadow-brand-900/20 transition-transform hover:-translate-y-0.5"
            >
              Coba Gratis
              <ArrowRight size={16} />
            </Link>
            <Link
              href="#produk"
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/30 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Lihat Semua Aplikasi
            </Link>
          </div>
        </div>

        <svg
          aria-hidden
          viewBox="0 0 1440 60"
          className="relative block w-full text-zinc-50"
          preserveAspectRatio="none"
        >
          <path fill="currentColor" d="M0,32 C480,80 960,0 1440,32 L1440,60 L0,60 Z" />
        </svg>
      </div>

      {/* Value props */}
      <div className="mx-auto w-full max-w-4xl px-6 py-14 sm:py-20">
        <div className="grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((prop) => {
            const Icon = prop.icon;
            return (
              <div key={prop.title} className="flex flex-col items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                  <Icon size={19} />
                </div>
                <h3 className="text-sm font-semibold text-zinc-900">{prop.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{prop.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Produk */}
      <div id="produk" className="mx-auto w-full max-w-4xl scroll-mt-8 px-6 pb-20">
        <div className="mb-8 text-center">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-600">
            Aplikasi Kami
          </h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-zinc-900">
            Dipakai langsung, tanpa ribet
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div
                key={product.name}
                className={`group relative flex flex-col items-start gap-4 overflow-hidden rounded-2xl border p-7 text-left transition-all ${
                  product.available
                    ? "border-zinc-100 bg-white shadow-sm shadow-zinc-200/60 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-300/50"
                    : "border-dashed border-zinc-200 bg-white/60"
                }`}
              >
                <div
                  className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${product.accent}`}
                />
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg ${product.accent}`}
                >
                  <Icon size={24} />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-400">{product.tagline}</p>
                  <h3 className="mt-0.5 text-lg font-bold text-zinc-900">{product.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {product.description}
                  </p>
                </div>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {product.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-medium text-brand-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {product.available && product.href ? (
                  <Link
                    href={product.href}
                    className="mt-auto inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-brand-700"
                  >
                    {product.cta}
                    <ArrowRight
                      size={15}
                      className="transition-transform group-hover:translate-x-0.5"
                    />
                  </Link>
                ) : (
                  <span className="mt-auto rounded-lg bg-zinc-100 px-4 py-2.5 text-sm font-medium text-zinc-400">
                    {product.cta}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA banner */}
      <div className="mx-auto w-full max-w-4xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 to-brand-900 px-8 py-12 text-center sm:px-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -top-16 -right-16 h-56 w-56 rounded-full bg-white/10 blur-3xl"
          />
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Siap rapikan absensi dan payroll bisnis Anda?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-brand-50/80">
            Coba HR Cashimpact — tanpa kartu kredit, langsung bisa dipakai
            dalam hitungan menit.
          </p>
          <Link
            href="https://hr.cashimpact.id/signup"
            className="relative mt-6 inline-flex items-center gap-1.5 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-brand-700 shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Daftar Gratis
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      <footer className="border-t border-zinc-100 bg-white py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Cashimpact — Createimpact.id
      </footer>
    </div>
  );
}
