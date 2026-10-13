"use client";

import { useTransition } from "react";
import { markBusinessPaid, markBusinessUnpaid } from "./actions";

export default function MarkPaidButton({
  businessId,
  action,
  label,
}: {
  businessId: string;
  action: "paid" | "unpaid";
  label: string;
}) {
  const [pending, startTransition] = useTransition();

  function run() {
    if (action === "paid" && !confirm("Tandai bisnis ini sudah lunas? Akun bisnisnya langsung aktif penuh.")) return;
    startTransition(async () => {
      const r = action === "paid" ? await markBusinessPaid(businessId) : await markBusinessUnpaid(businessId);
      if (r.error) alert(r.error);
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className={`shrink-0 rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        action === "paid" ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-zinc-200 text-zinc-600 hover:bg-zinc-50"
      }`}
    >
      {pending ? "Memproses…" : label}
    </button>
  );
}
