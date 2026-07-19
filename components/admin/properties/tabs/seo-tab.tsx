"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { propertySeoSchema, type PropertySeoInput } from "@/lib/validations/property.schema";
import { updatePropertySeo } from "@/lib/actions/properties";
import { generatePropertySlug } from "@/lib/utils";
import type { Property } from "@/types";

export function SeoTab({ property, cityName }: { property: Property; cityName?: string }) {
  const [saving, setSaving] = useState(false);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<PropertySeoInput>({
    resolver: zodResolver(propertySeoSchema),
    defaultValues: {
      slug: property.slug,
      seo_title: property.seo_title ?? "",
      seo_description: property.seo_description ?? "",
      og_image: property.og_image ?? "",
    },
  });

  async function onSubmit(values: PropertySeoInput) {
    setSaving(true);
    const result = await updatePropertySeo(property.id, values);
    setSaving(false);
    if (result.success) toast.success("SEO settings saved");
    else toast.error(result.error || "Could not save");
  }

  function regenerateSlug() {
    setValue(
      "slug",
      generatePropertySlug(property.title, cityName || "marrakech", property.listing_type, property.reference),
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 max-w-2xl">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">URL Slug</Label>
        <div className="flex gap-2">
          <Input {...register("slug")} className="font-mono text-sm" />
          <Button type="button" variant="outline" size="icon" onClick={regenerateSlug} title="Regenerate from title/city/reference">
            <RefreshCw className="size-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">/properties/{property.slug}</p>
        {errors.slug && <p className="text-xs text-destructive">{errors.slug.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Title</Label>
        <Input {...register("seo_title")} placeholder={property.title} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">SEO Description</Label>
        <Textarea rows={3} {...register("seo_description")} placeholder="Shown in search results and social shares" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs uppercase tracking-wide text-muted-foreground">Social Sharing Image URL</Label>
        <Input {...register("og_image")} placeholder="https://res.cloudinary.com/.../cover.jpg" />
      </div>

      <Button type="submit" disabled={saving} className="bg-bronze text-white hover:bg-bronze/90">
        {saving ? "Saving..." : "Save SEO"}
      </Button>
    </form>
  );
}
