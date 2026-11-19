"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useController, type Control } from "react-hook-form";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import type { PropertyFilters } from "@/types";

interface FormValues {
  listingType: string;
  rentalTerm: string;
  category: string;
  city: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
  minArea: string;
  maxArea: string;
  furnished: boolean;
  pool: boolean;
  garden: boolean;
  terrace: boolean;
  parking: boolean;
  availableOnly: boolean;
  featured: boolean;
}

export function PropertyFiltersPanel({
  basePath,
  filters,
  lockListingType = false,
  lockCategory = false,
  categories,
}: {
  basePath: string;
  filters: PropertyFilters;
  lockListingType?: boolean;
  lockCategory?: boolean;
  categories: { slug: string; name: string }[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const { register, handleSubmit, watch, setValue, reset, control } = useForm<FormValues>({
    defaultValues: {
      listingType: filters.listingType ?? "any",
      rentalTerm: filters.rentalTerm ?? "any",
      category: filters.categorySlug ?? "any",
      city: filters.citySlug ?? "any",
      minPrice: filters.minPrice?.toString() ?? "",
      maxPrice: filters.maxPrice?.toString() ?? "",
      bedrooms: filters.bedrooms?.toString() ?? "any",
      bathrooms: filters.bathrooms?.toString() ?? "any",
      minArea: filters.minArea?.toString() ?? "",
      maxArea: filters.maxArea?.toString() ?? "",
      furnished: filters.furnished ?? false,
      pool: filters.pool ?? false,
      garden: filters.garden ?? false,
      terrace: filters.terrace ?? false,
      parking: filters.parking ?? false,
      availableOnly: filters.availableOnly ?? false,
      featured: filters.featuredOnly ?? false,
    },
  });

  function onSubmit(values: FormValues) {
    const params = new URLSearchParams(searchParams.toString());
    const setOrDelete = (key: string, value: string | undefined) => {
      if (value && value !== "any" && value !== "") params.set(key, value);
      else params.delete(key);
    };

    if (!lockListingType) setOrDelete("listingType", values.listingType);
    setOrDelete("rentalTerm", values.rentalTerm);
    if (!lockCategory) setOrDelete("category", values.category);
    setOrDelete("city", values.city);
    setOrDelete("minPrice", values.minPrice);
    setOrDelete("maxPrice", values.maxPrice);
    setOrDelete("bedrooms", values.bedrooms);
    setOrDelete("bathrooms", values.bathrooms);
    setOrDelete("minArea", values.minArea);
    setOrDelete("maxArea", values.maxArea);
    params.delete("page");

    for (const key of ["furnished", "pool", "garden", "terrace", "parking", "availableOnly", "featured"] as const) {
      if (values[key]) params.set(key, "true");
      else params.delete(key);
    }

    router.push(`${basePath}?${params.toString()}`);
    setOpen(false);
  }

  function onReset() {
    reset();
    router.push(basePath);
    setOpen(false);
  }

  const content = (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {!lockListingType && (
        <Field label="Sale or Rent">
          <Select value={watch("listingType")} onValueChange={(v) => v && setValue("listingType", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="sale">For Sale</SelectItem>
              <SelectItem value="rent">For Rent</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}

      {!lockCategory && (
        <Field label="Category">
          <Select value={watch("category")} onValueChange={(v) => v && setValue("category", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      )}

      {(lockListingType ? filters.listingType === "rent" : watch("listingType") === "rent") && (
        <Field label="Rental Duration">
          <Select value={watch("rentalTerm")} onValueChange={(v) => v && setValue("rentalTerm", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              <SelectItem value="short_term">Short-Term</SelectItem>
              <SelectItem value="long_term">Long-Term</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      )}

      <Field label="City">
        <Select value={watch("city")} onValueChange={(v) => v && setValue("city", v)}>
          <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="any">Any</SelectItem>
            <SelectItem value="marrakech">Marrakech</SelectItem>
            <SelectItem value="agadir">Agadir</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Min Price"><Input type="number" placeholder="MAD" {...register("minPrice")} /></Field>
        <Field label="Max Price"><Input type="number" placeholder="MAD" {...register("maxPrice")} /></Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Bedrooms">
          <Select value={watch("bedrooms")} onValueChange={(v) => v && setValue("bedrooms", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Bathrooms">
          <Select value={watch("bathrooms")} onValueChange={(v) => v && setValue("bathrooms", v)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Any</SelectItem>
              {[1, 2, 3, 4, 5].map((n) => <SelectItem key={n} value={String(n)}>{n}+</SelectItem>)}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Min Area (m²)"><Input type="number" {...register("minArea")} /></Field>
        <Field label="Max Area (m²)"><Input type="number" {...register("maxArea")} /></Field>
      </div>

      <div className="flex flex-col gap-3">
        <CheckField id="furnished" label="Furnished" control={control} />
        <CheckField id="pool" label="Swimming Pool" control={control} />
        <CheckField id="garden" label="Garden" control={control} />
        <CheckField id="terrace" label="Terrace" control={control} />
        <CheckField id="parking" label="Parking" control={control} />
        <CheckField id="availableOnly" label="Available Only" control={control} />
        <CheckField id="featured" label="Featured Properties" control={control} />
      </div>

      <div className="flex gap-2">
        <Button type="submit" className="flex-1 bg-bronze text-white hover:bg-bronze/90">
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={onReset}>
          Reset
        </Button>
      </div>
    </form>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:block w-72 shrink-0 rounded-2xl border border-border bg-card p-5 h-fit sticky top-24">
        <p className="mb-4 flex items-center gap-2 font-heading text-base text-charcoal">
          <SlidersHorizontal className="size-4" /> Filters
        </p>
        {content}
      </aside>

      {/* Mobile */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="gap-2" />
            }
          >
            <SlidersHorizontal className="size-4" /> Filters
          </SheetTrigger>
          <SheetContent side="left" className="w-full max-w-sm overflow-y-auto p-0">
            <SheetHeader className="border-b border-border px-5 py-4">
              <SheetTitle className="flex items-center justify-between">
                Filters
                <X className="size-4" onClick={() => setOpen(false)} />
              </SheetTitle>
            </SheetHeader>
            <div className="p-5">{content}</div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function CheckField({
  id,
  label,
  control,
}: {
  id: keyof FormValues;
  label: string;
  control: Control<FormValues>;
}) {
  const { field } = useController({ name: id, control });
  return (
    <div className="flex items-center gap-2">
      <Checkbox
        id={id}
        checked={Boolean(field.value)}
        onCheckedChange={(checked) => field.onChange(Boolean(checked))}
      />
      <Label htmlFor={id} className="text-sm font-normal text-charcoal/80">
        {label}
      </Label>
    </div>
  );
}
