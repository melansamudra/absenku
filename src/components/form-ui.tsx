// Primitif form bergaya GajiHub: label dengan * merah untuk field wajib,
// input/select outline lembut, tombol utama biru ABSENKU.
import type { ReactNode } from "react";

export const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 placeholder:text-zinc-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 disabled:bg-zinc-50 disabled:text-zinc-400";

export function Field({
  label,
  required,
  hint,
  children,
  className = "",
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-xs font-medium text-zinc-600">
        {required && <span className="mr-0.5 text-red-500">*</span>}
        {label}
      </label>
      {children}
      {hint && <p className="mt-1 text-[11px] text-zinc-400">{hint}</p>}
    </div>
  );
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-4 border-b border-zinc-100 pb-2 text-sm font-bold text-zinc-900">{children}</h3>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-100 bg-white p-5 shadow-sm sm:p-6 ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export const btnPrimary =
  "inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60";
export const btnOutline =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-4 py-2 text-[13px] font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-60";
