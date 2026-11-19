"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { contactSchema, type ContactInput } from "@/lib/validations/contact.schema";
import { notifyViaFormSubmit } from "@/lib/formsubmit-client";

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactInput) {
    setStatus("idle");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = (await res.json()) as { ok: boolean; emailed?: boolean };
      setStatus("success");
      reset();

      if (!data.emailed) {
        void notifyViaFormSubmit(`New general enquiry from ${values.fullName}`, {
          Name: values.fullName,
          Phone: values.phone,
          Email: values.email,
          Message: values.message,
        });
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-10 text-bronze" />
        <p className="font-heading text-lg text-charcoal">Message sent</p>
        <p className="text-sm text-muted-foreground">Thank you for reaching out — a Tinoubia advisor will be in touch shortly.</p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="contact-company">Company</label>
        <input id="contact-company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Full Name</Label>
        <Input {...register("fullName")} placeholder="Your full name" />
        {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Phone Number</Label>
        <Input {...register("phone")} placeholder="+212 6XX XXX XXX" />
        {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Email</Label>
        <Input type="email" {...register("email")} placeholder="you@example.com" />
        {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Message</Label>
        <Textarea rows={5} {...register("message")} placeholder="Tell us what you're looking for..." />
        {errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}
      </div>

      <Button type="submit" disabled={isSubmitting} className="bg-bronze text-white hover:bg-bronze/90">
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
