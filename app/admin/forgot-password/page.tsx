import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ForgotPasswordForm } from "@/components/admin/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Password",
  robots: { index: false, follow: false },
};

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Tinoubia Immobilier" width={228} height={150} className="h-14 w-auto" unoptimized />
          </Link>
          <h1 className="font-heading text-xl text-charcoal">Reset Password</h1>
          <p className="text-sm text-muted-foreground">Enter your admin email and we&apos;ll send you a reset link.</p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            That reset link is invalid or has expired. Links work once, for one hour, and only in the browser
            they were requested from. Request a new one below.
          </p>
        )}

        <ForgotPasswordForm />

        <p className="mt-6 text-center text-xs">
          <Link href="/admin/login" className="text-muted-foreground hover:text-bronze">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
