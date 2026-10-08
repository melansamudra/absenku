import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import type { Database } from "@/lib/types/database";

export async function updateSession(request: NextRequest) {
  // Next.js still sends prefetch requests ("next-router-prefetch") through
  // this proxy even for dynamic destinations that aren't really prefetched —
  // if getUser() (which can trigger a GoTrue token refresh) ran here too,
  // the prefetch's refresh could race a real navigation's refresh and get
  // the refresh token "used up" first, bouncing the user to /login even
  // though the session is actually still valid. So prefetch requests just
  // pass through untouched; the real session check happens once actual
  // navigation reaches the server.
  if (request.headers.get("next-router-prefetch")) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Required: refreshes the auth token and keeps cookies in sync.
  // Do not add logic between createServerClient and this call.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const authPages = ["/login", "/signup", "/forgot-password"];
  const isAuthPage = authPages.some((path) =>
    request.nextUrl.pathname.startsWith(path),
  );
  // /absen/* adalah halaman absen selfie karyawan (buka link/QR publik per
  // bisnis) — tanpa login, karyawan tidak punya akun. /api/attendance-checkin
  // adalah API route yang dipanggil dari halaman itu, juga tanpa sesi browser.
  // /cuti/* adalah halaman pengajuan cuti publik — sama alasannya, karyawan
  // submit lewat RPC security definer, bukan API route, jadi tidak perlu
  // whitelist /api/* juga.
  // /karyawan/* adalah Portal Karyawan — login pakai PIN absen (cookie sesi
  // sendiri, lihat lib/portal/session.ts), bukan akun Supabase Auth.
  // /auth/callback menukar kode dari link email jadi sesi, sebelum user ada.
  // /reset-password: link reset dari email membawa token di URL fragment
  // (#access_token=...), yang cuma bisa dibaca & diproses oleh supabase-js di
  // browser — belum ada sesi/cookie sama sekali saat request pertama ini
  // sampai ke middleware, jadi tidak boleh di-redirect ke /login dulu.
  const isPublicPath =
    isAuthPage ||
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/absen") ||
    request.nextUrl.pathname.startsWith("/cuti") ||
    request.nextUrl.pathname.startsWith("/karyawan") ||
    request.nextUrl.pathname.startsWith("/api/attendance-checkin") ||
    request.nextUrl.pathname.startsWith("/auth/callback") ||
    request.nextUrl.pathname.startsWith("/reset-password") ||
    request.nextUrl.pathname.startsWith("/set-password");

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
