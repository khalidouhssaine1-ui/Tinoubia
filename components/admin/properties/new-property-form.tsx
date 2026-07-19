"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { propertyBasicFormSchema, type PropertyBasicInput } from "@/lib/validations/property.schema";
import { createProperty } from "@/lib/actions/properties";
import type { PropertyType } from "@/types";

export function NewPropertyForm({ propertyTypes }: { propertyTypes: PropertyType[] }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<PropertyBasicInput>({
    resolver: zodResolver(propertyBasicFormSchema) as Resolver<PropertyBasicInput>,
    defaultValues: {
      title: "",
      reference: "",
      listing_type: "sale",
      rental_term: null,
      currency: "MAD",
      status: "draft",
      featured: false,
    },
  });

  const listingType = watch("listing_type");

  async function onSubmit(values: PropertyBasicInput) {
    setSaving(true);
    const result = await createProperty(values);
    setSaving(false);
    if (result.success && result.id) {
      toast.success("Property created — continue editing below");
      router.push(`/admin/properties/${result.id}/edit`);
    } else {
      toast.error(result.error || "Could not create property");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-xl space-y-5 rounded-2xl border border-border bg-card p-6">
      <Field label="Title" error={errors.title?.message}>
        <Input {...register("title")} placeholder="Villa Zahra" autoFocus />
      </Field>

      <Field label="Reference (leave blank to auto-generate)" error={errors.reference?.message}>
        <Input {...register("reference")} placeholder="Auto-generated if left blank" />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Sale or Rent">
          <Controller
            name="listing_type"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">For Sale</SelectItem>
                  <SelectItem value="rent">For Rent</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="Category" error={errors.property_type_id?.message}>
          <Controller
            name="property_type_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {propertyTypes.map((pt) => (
                    <SelectItem key={pt.id} value={pt.id}>{pt.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      {listingType === "rent" && (
        <Field label="Rental Duration" error={errors.rental_term?.message}>
          <Controller
            name="rental_term"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select duration" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="short_term">Short-Term</SelectItem>
                  <SelectItem value="long_term">Long-Term</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      )}

      <div className="grid grid-cols-2 gap-4">
        <Field label="Price" error={errors.price?.message}>
          <Input type="number" step="0.01" {...register("price")} />
        </Field>
        <Field label="Currency">
          <Input {...register("currency")} />
        </Field>
      </div>

      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Creating..." : "Create & Continue"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
