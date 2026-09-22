"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 disabled:opacity-60"
    >
      {loading ? "Keluar…" : "Keluar"}
    </button>
  );
}
