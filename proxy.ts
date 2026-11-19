import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 renamed the `middleware` file convention to `proxy` (same
// behaviour, now always on the Node.js runtime).
export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only /admin/* needs session refresh + the auth guard. Every other route
  // (the entire public site) previously ran a Supabase auth round-trip on
  // every request for no reason — this matcher skips the proxy function
  // entirely for public pages instead of just early-returning inside it.
  matcher: ["/admin/:path*"],
};
