"use client";

import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { readNavStack } from "./nav-tracker";

// Kalau halaman sebelumnya di portal memang halaman induk, pakai
// router.back(): Next.js memulihkan halaman dari cache klien seketika (tanpa
// menunggu server). Kalau tidak, pindah ke halaman induk seperti link biasa.
export default function BackButton({ href }: { href: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Kembali"
      onClick={() => {
        const stack = readNavStack();
        if (stack.length >= 2 && stack[stack.length - 2] === href) router.back();
        else router.push(href);
      }}
      className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10 active:bg-white/20"
    >
      <ChevronLeft className="h-7 w-7" strokeWidth={2.25} aria-hidden="true" />
    </button>
  );
}
