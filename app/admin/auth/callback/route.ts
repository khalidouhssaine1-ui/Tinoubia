import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Landing point for links in Supabase auth emails (password reset). Swaps the
 * one-time `code` for a session cookie, then continues to `next` — only ever an
 * /admin path, so the link can't be used to redirect elsewhere.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const destination = next && next.startsWith("/admin/") && !next.startsWith("//") ? next : "/admin";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(destination, origin));
    }
    console.error("[auth/callback] code exchange failed", error.message);
  }

  return NextResponse.redirect(new URL("/admin/forgot-password?error=link", origin));
}
