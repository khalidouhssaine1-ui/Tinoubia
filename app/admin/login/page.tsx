import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-charcoal px-4">
      <div className="w-full max-w-sm rounded-2xl bg-card p-8 shadow-2xl">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/">
            <Image src="/logo.png" alt="Tinoubia Immobilier" width={228} height={150} className="h-14 w-auto" unoptimized />
          </Link>
          <h1 className="font-heading text-xl text-charcoal">Admin</h1>
          <p className="text-sm text-muted-foreground">Sign in to manage properties, leads and content.</p>
        </div>

        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
