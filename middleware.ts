import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Only /admin/* needs session refresh + the auth guard. Every other route
  // (the entire public site) previously ran a Supabase auth round-trip on
  // every request for no reason — this matcher skips the middleware function
  // entirely for public pages instead of just early-returning inside it.
  matcher: ["/admin/:path*"],
};
