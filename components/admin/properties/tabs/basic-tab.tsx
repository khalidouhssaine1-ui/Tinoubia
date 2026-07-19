"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { propertyBasicFormSchema, type PropertyBasicInput } from "@/lib/validations/property.schema";
import { updatePropertyBasics } from "@/lib/actions/properties";
import type { Property, PropertyType } from "@/types";

export function BasicTab({ property, propertyTypes }: { property: Property; propertyTypes: PropertyType[] }) {
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
      title: property.title,
      reference: property.reference,
      listing_type: property.listing_type,
      rental_term: property.rental_term,
      property_type_id: property.property_type_id,
      price: property.price,
      currency: property.currency,
      status: property.status,
      featured: property.featured,
    },
  });

  const listingType = watch("listing_type");

  async function onSubmit(values: PropertyBasicInput) {
    setSaving(true);
    const result = await updatePropertyBasics(property.id, values);
    setSaving(false);
    if (result.success) toast.success("Basic info saved");
    else toast.error(result.error || "Could not save");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <Field label="Title" error={errors.title?.message}>
        <Input {...register("title")} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Reference">
          <Input {...register("reference")} disabled />
        </Field>
        <Field label="Currency">
          <Input {...register("currency")} />
        </Field>
      </div>

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

        <Field label="Category">
          <Controller
            name="property_type_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
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
        <Field label="Availability Status">
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                  <SelectItem value="rented">Rented</SelectItem>
                  <SelectItem value="sold">Sold</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <div className="flex items-center gap-3">
        <Controller
          name="featured"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        <Label>Featured property</Label>
      </div>

      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save Basic Info"}
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
