"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export const NAV_STACK_KEY = "portal-nav-stack";

export function readNavStack(): string[] {
  try {
    const raw = sessionStorage.getItem(NAV_STACK_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

// Mencatat urutan halaman portal yang dibuka di tab ini, supaya tombol kembali
// tahu apakah halaman sebelumnya memang halaman induk di dalam portal (lalu
// memakai riwayat browser yang instan), atau portal dibuka langsung dari link.
export default function NavTracker() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const url = search ? `${pathname}?${search}` : pathname;

  useEffect(() => {
    try {
      const stack = readNavStack();
      if (stack[stack.length - 1] === url) return;
      if (stack[stack.length - 2] === url) stack.pop();
      else stack.push(url);
      sessionStorage.setItem(NAV_STACK_KEY, JSON.stringify(stack.slice(-30)));
    } catch {
      // sessionStorage bisa diblokir — tombol kembali tetap jalan lewat link biasa.
    }
  }, [url]);

  return null;
}
