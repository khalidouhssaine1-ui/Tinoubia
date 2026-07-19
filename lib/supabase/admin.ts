import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

/**
 * Service-role client. Bypasses RLS entirely — never import this into
 * client-side code or expose its result to the browser. Reserved for:
 *  - inserting public enquiries into `leads` (which has no anon RLS policy)
 *  - server-side Cloudinary asset bookkeeping
 * The `server-only` import makes any accidental client-bundle usage a build error.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
