import type { Viewport } from "next";
import { Suspense } from "react";
import NavTracker from "./[slug]/nav-tracker";

// Halaman karyawan dipakai di HP seperti aplikasi: kunci zoom supaya layar
// tidak membesar sendiri (mis. saat input diketuk atau layar disentuh dua kali).
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <NavTracker />
      </Suspense>
      {children}
    </>
  );
}
