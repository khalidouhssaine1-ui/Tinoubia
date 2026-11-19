"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { newPasswordSchema, type NewPasswordInput } from "@/lib/validations/auth.schema";

/** Sets a new password for the signed-in account (also used after a reset link). */
export function NewPasswordForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordInput>({ resolver: zodResolver(newPasswordSchema) });

  async function onSubmit(values: NewPasswordInput) {
    setServerError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: values.password });

    if (error) {
      setServerError(
        error.code === "same_password"
          ? "The new password must be different from the current one."
          : error.message || "Could not change the password. Please try again.",
      );
      return;
    }

    reset();
    toast.success("Password changed");
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="new-password" className="text-xs uppercase tracking-wide text-muted-foreground">
          New password
        </Label>
        <Input id="new-password" type="password" autoComplete="new-password" {...register("password")} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="confirm-password" className="text-xs uppercase tracking-wide text-muted-foreground">
          Confirm new password
        </Label>
        <Input id="confirm-password" type="password" autoComplete="new-password" {...register("confirm")} />
        {errors.confirm && <p className="text-xs text-destructive">{errors.confirm.message}</p>}
      </div>

      {serverError && <p className="text-sm text-destructive">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-2 gap-2 bg-bronze text-white hover:bg-bronze/90">
        {isSubmitting && <Loader2 className="size-4 animate-spin" />}
        Save new password
      </Button>
    </form>
  );
}
