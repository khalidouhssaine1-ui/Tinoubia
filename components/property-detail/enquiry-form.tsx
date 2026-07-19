"use client";

import { useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { enquirySchema, type EnquiryInput } from "@/lib/validations/enquiry.schema";
import { Controller } from "react-hook-form";

interface EnquiryFormProps {
  propertyId: string;
  propertyTitle: string;
  propertyReference: string;
  propertyUrl: string;
}

export function EnquiryForm({ propertyId, propertyTitle, propertyReference, propertyUrl }: EnquiryFormProps) {
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema) as Resolver<EnquiryInput>,
    defaultValues: {
      preferredContact: "phone",
      propertyId,
      propertyTitle,
      propertyReference,
      propertyUrl,
      company: "",
    },
  });

  async function onSubmit(values: EnquiryInput) {
    setStatus("idle");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      reset({ preferredContact: "phone", propertyId, propertyTitle, propertyReference, propertyUrl, company: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-8 text-center">
        <CheckCircle2 className="size-10 text-bronze" />
        <p className="font-heading text-lg text-charcoal">Enquiry sent</p>
        <p className="text-sm text-muted-foreground">
          Thank you — a Tinoubia advisor will get back to you shortly.
        </p>
        <Button variant="outline" size="sm" onClick={() => setStatus("idle")}>
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-heading text-lg text-charcoal">Enquire About This Property</h2>

      <input type="hidden" {...register("propertyId")} />
      <input type="hidden" {...register("propertyTitle")} />
      <input type="hidden" {...register("propertyReference")} />
      <input type="hidden" {...register("propertyUrl")} />

      {/* Honeypot — real visitors never see or fill this. */}
      <div className="absolute -left-[9999px]" aria-hidden="true">
        <label htmlFor="company">Company</label>
        <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      <FieldGroup label="Full Name" error={errors.fullName?.message}>
        <Input {...register("fullName")} placeholder="Your full name" />
      </FieldGroup>

      <FieldGroup label="Phone Number" error={errors.phone?.message}>
        <Input {...register("phone")} placeholder="+212 6XX XXX XXX" />
      </FieldGroup>

      <FieldGroup label="Email" error={errors.email?.message}>
        <Input type="email" {...register("email")} placeholder="you@example.com" />
      </FieldGroup>

      <FieldGroup label="Preferred Contact Method">
        <Controller
          name="preferredContact"
          control={control}
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="phone">Phone</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Desired Visit Date">
          <Input type="date" {...register("visitDate")} />
        </FieldGroup>
        <FieldGroup label="Number of People">
          <Input type="number" min={1} max={50} {...register("numPeople")} />
        </FieldGroup>
      </div>

      <FieldGroup label="Message" error={errors.message?.message}>
        <Textarea rows={4} {...register("message")} placeholder="I'd like to know more about..." />
      </FieldGroup>

      <Button type="submit" disabled={isSubmitting} className="bg-bronze text-white hover:bg-bronze/90">
        {isSubmitting ? "Sending..." : "Send Enquiry"}
      </Button>

      {status === "error" && (
        <p className="text-sm text-destructive">Something went wrong — please try again in a moment.</p>
      )}
    </form>
  );
}

function FieldGroup({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
