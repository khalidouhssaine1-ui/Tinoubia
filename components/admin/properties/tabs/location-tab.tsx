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
import { MapPicker } from "@/components/admin/properties/map-picker";
import { propertyLocationSchema, type PropertyLocationInput } from "@/lib/validations/property.schema";
import { updatePropertyLocation } from "@/lib/actions/properties";
import type { City, Country, Neighborhood, Property } from "@/types";

export function LocationTab({
  property,
  countries,
  cities,
  neighborhoods,
}: {
  property: Property;
  countries: Country[];
  cities: City[];
  neighborhoods: Neighborhood[];
}) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PropertyLocationInput>({
    resolver: zodResolver(propertyLocationSchema) as Resolver<PropertyLocationInput>,
    defaultValues: {
      country_id: property.country_id,
      city_id: property.city_id ?? undefined,
      neighborhood_id: property.neighborhood_id,
      address: property.address ?? "",
      show_full_address: property.show_full_address,
      latitude: property.latitude,
      longitude: property.longitude,
      google_maps_url: property.google_maps_url ?? "",
    },
  });

  const cityId = watch("city_id");
  const filteredNeighborhoods = neighborhoods.filter((n) => n.city_id === cityId);

  async function onSubmit(values: PropertyLocationInput) {
    setSaving(true);
    const result = await updatePropertyLocation(property.id, values);
    setSaving(false);
    if (result.success) toast.success("Location saved");
    else toast.error(result.error || "Could not save");
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Country">
          <Controller
            name="country_id"
            control={control}
            render={({ field }) => (
              <Select value={field.value ?? undefined} onValueChange={field.onChange}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select country" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Field>

        <Field label="City" error={errors.city_id?.message}>
          <Controller
            name="city_id"
            control={control}
            render={({ field }) => (
              <Select
                value={field.value}
                onValueChange={(v) => {
                  field.onChange(v);
                  setValue("neighborhood_id", null);
                }}
              >
                <SelectTrigger className="w-full"><SelectValue placeholder="Select city" /></SelectTrigger>
                <SelectContent>
                  {cities.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          />
        </Field>
      </div>

      <Field label="Neighborhood">
        <Controller
          name="neighborhood_id"
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? undefined} onValueChange={field.onChange} disabled={!cityId}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select neighborhood" /></SelectTrigger>
              <SelectContent>
                {filteredNeighborhoods.map((n) => <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>)}
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      <Field label="Address">
        <Input {...register("address")} placeholder="Street, building, landmark..." />
      </Field>

      <div className="flex items-center gap-3">
        <Controller
          name="show_full_address"
          control={control}
          render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
        />
        <Label>Show full address publicly</Label>
      </div>

      <Field label="Google Maps URL">
        <Input {...register("google_maps_url")} placeholder="https://maps.google.com/?q=..." />
      </Field>

      <div>
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Map Position (click to set)</Label>
        <div className="mt-2">
          <Controller
            name="latitude"
            control={control}
            render={({ field: latField }) => (
              <Controller
                name="longitude"
                control={control}
                render={({ field: lngField }) => (
                  <MapPicker
                    latitude={latField.value ?? null}
                    longitude={lngField.value ?? null}
                    onChange={(lat, lng) => {
                      latField.onChange(lat);
                      lngField.onChange(lng);
                    }}
                  />
                )}
              />
            )}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Latitude"><Input type="number" step="0.0000001" {...register("latitude")} /></Field>
        <Field label="Longitude"><Input type="number" step="0.0000001" {...register("longitude")} /></Field>
      </div>

      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save Location"}
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
