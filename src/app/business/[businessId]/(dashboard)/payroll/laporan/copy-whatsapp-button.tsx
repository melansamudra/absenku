"use client";

import { useState } from "react";

export default function CopyWhatsappButton({ text, disabled }: { text: string; disabled?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Salin teks ini:", text);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      disabled={disabled}
      className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 disabled:opacity-50"
    >
      {copied ? "✓ Tersalin" : "📋 Salin untuk WA"}
    </button>
  );
}
