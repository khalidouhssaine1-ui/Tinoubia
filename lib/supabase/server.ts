import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

/**
 * Session-bound server client. Every query goes through Postgres RLS as the
 * signed-in user (or anon) — use this everywhere except the few server-only
 * mutations that intentionally need to bypass RLS (see admin.ts).
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component render — proxy.ts refreshes the
            // session cookie instead, so this can be safely ignored.
          }
        },
      },
    },
  );
}
