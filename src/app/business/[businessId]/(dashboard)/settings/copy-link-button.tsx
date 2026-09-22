"use client";

import { useState } from "react";

export default function CopyLinkButton({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API bisa gagal (mis. tidak ada izin) — link tetap
      // terlihat di layar untuk disalin manual.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
    >
      {copied ? "Tersalin!" : "Salin"}
    </button>
  );
}
