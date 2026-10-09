"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

export default function MonthSelect({
  slug,
  page,
  value,
  options,
  dark = false,
}: {
  slug: string;
  page: string;
  value: string;
  options: { value: string; label: string }[];
  dark?: boolean;
}) {
  const router = useRouter();
  return (
    <div className="relative">
      <select
        aria-label="Pilih bulan"
        value={value}
        onChange={(e) => router.push(`/karyawan/${slug}?p=${page}&m=${e.target.value}`)}
        className={`w-full appearance-none rounded-2xl px-4 py-3.5 pr-10 text-sm ${
          dark ? "bg-portal-800 text-white" : "bg-white text-portal-800"
        }`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className={`pointer-events-none absolute right-3.5 top-1/2 h-5 w-5 -translate-y-1/2 ${dark ? "text-white" : "text-portal-800"}`}
        aria-hidden="true"
      />
    </div>
  );
}
