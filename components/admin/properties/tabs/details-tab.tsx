"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { propertyDetailsSchema, type PropertyDetailsInput } from "@/lib/validations/property.schema";
import { updatePropertyDetails } from "@/lib/actions/properties";
import { getFeatureIcon } from "@/lib/feature-icons";
import type { Feature, Property } from "@/types";

export function DetailsTab({
  property,
  features,
  selectedFeatureIds,
}: {
  property: Property;
  features: Feature[];
  selectedFeatureIds: string[];
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<PropertyDetailsInput>({
    resolver: zodResolver(propertyDetailsSchema) as Resolver<PropertyDetailsInput>,
    defaultValues: {
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      living_area: property.living_area,
      land_area: property.land_area,
      floors: property.floors,
      year_built: property.year_built,
      furnished: property.furnished,
      description: property.description ?? "",
      feature_ids: selectedFeatureIds,
    },
  });

  async function onSubmit(values: PropertyDetailsInput) {
    setSaving(true);
    const result = await updatePropertyDetails(property.id, values);
    setSaving(false);
    if (result.success) toast.success("Details saved");
    else toast.error(result.error || "Could not save");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="Bedrooms"><Input type="number" {...register("bedrooms")} /></Field>
        <Field label="Bathrooms"><Input type="number" {...register("bathrooms")} /></Field>
        <Field label="Floors"><Input type="number" {...register("floors")} /></Field>
        <Field label="Living Area (m²)"><Input type="number" {...register("living_area")} /></Field>
        <Field label="Land Area (m²)"><Input type="number" {...register("land_area")} /></Field>
        <Field label="Year Built"><Input type="number" {...register("year_built")} /></Field>
      </div>

      <div className="flex items-center gap-3">
        <Controller
          name="furnished"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        <Label>Furnished</Label>
      </div>

      <Field label="Description" error={errors.description?.message}>
        <Textarea rows={6} {...register("description")} />
      </Field>

      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Amenities</Label>
        <Controller
          name="feature_ids"
          control={control}
          render={({ field }) => (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {features.map((feature) => {
                const Icon = getFeatureIcon(feature.icon);
                const checked = field.value.includes(feature.id);
                return (
                  <label key={feature.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(v) =>
                        field.onChange(
                          v ? [...field.value, feature.id] : field.value.filter((id) => id !== feature.id),
                        )
                      }
                    />
                    <Icon className="size-3.5 text-bronze" />
                    {feature.name}
                  </label>
                );
              })}
            </div>
          )}
        />
      </div>

      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save Details"}
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
