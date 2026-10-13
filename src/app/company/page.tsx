import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CalendarCheck, ShoppingCart, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Cashimpact — Aplikasi Digital untuk Bisnis",
  description:
    "Cashimpact, bagian dari Createimpact.id, menghadirkan rangkaian aplikasi digital untuk operasional bisnis Anda.",
};

const products = [
  {
    name: "HR Cashimpact",
    description:
      "Absensi selfie, data karyawan, dan payroll — dalam satu aplikasi untuk bisnis Anda.",
    href: "https://hr.cashimpact.id",
    cta: "Buka Aplikasi",
    icon: CalendarCheck,
    available: true,
  },
  {
    name: "PosCash",
    description: "Aplikasi kasir digital untuk toko dan bisnis Anda.",
    href: null,
    cta: "Segera Hadir",
    icon: ShoppingCart,
    available: false,
  },
];

export default function CompanyPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-brand-400">
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
          className="pointer-events-none absolute -top-24 -left-20 h-72 w-72 rounded-full bg-white/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-32 right-0 h-96 w-96 rounded-full bg-brand-900/20 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:py-32">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/90 backdrop-blur-sm">
            <Sparkles size={13} />
            Bagian dari Createimpact.id
          </span>
          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
            Cashimpact
          </h1>
          <p className="max-w-lg text-base text-brand-50/90 sm:text-lg">
            Kumpulan aplikasi digital yang bikin operasional bisnis Anda lebih
            ringkas — dari absensi, SDM, payroll, hingga kasir.
          </p>
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

      {/* Produk */}
      <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-4 sm:pt-8">
        <h2 className="mb-6 text-center text-sm font-semibold uppercase tracking-wider text-zinc-400">
          Aplikasi kami
        </h2>
        <div className="grid gap-5 sm:grid-cols-2">
          {products.map((product) => {
            const Icon = product.icon;
            return (
              <div
                key={product.name}
                className={`group flex flex-col items-start gap-4 rounded-2xl border p-7 text-left transition-all ${
                  product.available
                    ? "border-zinc-100 bg-white shadow-sm shadow-zinc-200/60 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-zinc-300/40"
                    : "border-dashed border-zinc-200 bg-white/50"
                }`}
              >
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                    product.available
                      ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-md shadow-brand-600/20"
                      : "bg-zinc-100 text-zinc-400"
                  }`}
                >
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-900">{product.name}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-500">
                    {product.description}
                  </p>
                </div>
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

      <footer className="border-t border-zinc-100 bg-white py-6 text-center text-xs text-zinc-400">
        © {new Date().getFullYear()} Cashimpact — Createimpact.id
      </footer>
    </div>
  );
}
