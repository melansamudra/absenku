import { type NextRequest, NextResponse } from "next/server";

// Tombol "Lihat Portal Karyawan" di landing page — redirect ke Portal
// Karyawan bisnis demo (/karyawan/<slug>, publik, login pakai PIN contoh
// dari supabase/seed/README.md). Slug-nya di DEMO_PORTAL_SLUG; kalau belum
// di-setup, fallback ke /login.
export async function GET(request: NextRequest) {
  const slug = process.env.DEMO_PORTAL_SLUG;

  if (!slug) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL(`/karyawan/${slug}`, request.url));
}
