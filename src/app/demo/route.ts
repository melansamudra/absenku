import { type NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Tombol "Lihat Demo" di landing page — login otomatis ke akun demo (data
// contoh, lihat supabase/seed/README.md) tanpa perlu daftar. Kredensialnya
// di DEMO_LOGIN_EMAIL/DEMO_LOGIN_PASSWORD (server-only, bukan NEXT_PUBLIC_);
// kalau belum di-setup atau login gagal, fallback ke /login biasa.
export async function GET(request: NextRequest) {
  const email = process.env.DEMO_LOGIN_EMAIL;
  const password = process.env.DEMO_LOGIN_PASSWORD;

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
