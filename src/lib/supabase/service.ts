import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/database";

// Service-role client — bypasses RLS entirely. Only import this where there
// is genuinely no authenticated user session to scope queries to: the public
// selfie check-in API route (employees don't log in). Never import this from
// a Server Component, server action, or anywhere else a request is on behalf
// of a specific signed-in owner/admin — use src/lib/supabase/server.ts there
// instead so RLS stays in force.
export function createServiceClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}
