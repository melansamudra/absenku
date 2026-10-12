"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";

const TABS = [
  { key: "forms", label: "Formulir" },
  { key: "schedules", label: "Jadwal" },
  { key: "reviews", label: "Evaluasi" },
] as const;

export function KpiTabs({ businessId, active }: { businessId: string; active: (typeof TABS)[number]["key"] }) {
  return (
    <div className="mb-4 flex gap-1 overflow-x-auto">
      {TABS.map((t) => (
        <Link
          key={t.key}
          href={`/business/${businessId}/kpi/${t.key}`}
          className={`shrink-0 rounded-lg border px-4 py-1.5 text-[14px] ${
            active === t.key
              ? "border-brand-500 bg-white font-semibold text-brand-700"
              : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
          }`}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}

export function DeleteButton({
  action,
  confirmText,
}: {
  action: () => Promise<{ error: string | null }>;
  confirmText: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          if (!confirm(confirmText)) return;
          setError(null);
          startTransition(async () => {
            const r = await action();
            if (r.error) setError(r.error);
          });
        }}
        className="rounded-lg p-2 text-zinc-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
        aria-label="Hapus"
      >
        <Trash2 size={15} />
      </button>
      {error && <span className="max-w-48 text-right text-[12px] text-red-600">{error}</span>}
    </span>
  );
}
