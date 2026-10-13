import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Domain root cashimpact.id dipakai untuk landing page perusahaan Cashimpact
// (src/app/company), bukan aplikasi HR Cashimpact ini — yang tetap diakses
// lewat subdomain hr.cashimpact.id.
const COMPANY_LANDING_HOSTS = new Set(["cashimpact.id", "www.cashimpact.id"]);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] ?? "";
  if (COMPANY_LANDING_HOSTS.has(host) && request.nextUrl.pathname === "/") {
    return NextResponse.rewrite(new URL("/company", request.url));
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
