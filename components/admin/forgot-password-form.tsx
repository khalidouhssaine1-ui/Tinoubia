"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations/auth.schema";

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit({ email }: ForgotPasswordInput) {
    setServerError(null);
    const supabase = createClient();
    // The link lands on /admin/auth/callback, which signs the visitor in and
    // sends them to My Account to choose a new password.
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/admin/auth/callback?next=/admin/account`,
    });

    if (error) {
      setServerError(
        error.status === 429
          ? "Too many reset emails were requested. Please wait an hour and try again."
          : "Could not send the reset email. Please try again.",
      );
      return;
    }
    setSentTo(email);
  }

  if (sentTo) {
    return (
      <div className="flex flex-col items-center gap-2 text-center">
        <MailCheck className="size-8 text-bronze" />
        <p className="text-sm text-charcoal">
          If <span className="font-medium">{sentTo}</span> has an admin account, a reset link is on its way.
        </p>
        <p className="text-xs text-muted-foreground">
          Open the link in this same browser. It can take a few minutes — check the spam folder too.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email" className="text-xs uppercase tracking-wide text-muted-foreground">
          Email
        </Label>
        <Input id="email" type="email" autoComplete="username" {...register("email")} />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 gap-2 bg-bronze text-white hover:bg-bronze/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Send reset link
      </Button>
    </form>
  );
}
