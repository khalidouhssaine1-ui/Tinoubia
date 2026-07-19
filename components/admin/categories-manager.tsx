"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getFeatureIcon } from "@/lib/feature-icons";
import { createFeature, deleteFeature, updatePropertyTypeMeta } from "@/lib/actions/categories";
import { slugify } from "@/lib/utils";
import type { Feature, PropertyType } from "@/types";

export function CategoriesManager({
  propertyTypes: initialTypes,
  features: initialFeatures,
}: {
  propertyTypes: PropertyType[];
  features: Feature[];
}) {
  const [types, setTypes] = useState(initialTypes);
  const [features, setFeatures] = useState(initialFeatures);
  const [newFeature, setNewFeature] = useState("");
  const [isPending, startTransition] = useTransition();

  function saveType(id: string, name: string) {
    startTransition(async () => {
      const type = types.find((t) => t.id === id);
      const result = await updatePropertyTypeMeta(id, name, type?.icon || "");
      if (result.success) toast.success("Category updated");
      else toast.error(result.error || "Could not update");
    });
  }

  function addFeature() {
    if (!newFeature.trim()) return;
    startTransition(async () => {
      const result = await createFeature({ name: newFeature, slug: slugify(newFeature) });
      if (result.success && result.id) {
        setFeatures((prev) => [...prev, { id: result.id!, name: newFeature, slug: slugify(newFeature), icon: null, created_at: "" }]);
        setNewFeature("");
      } else {
        toast.error(result.error || "Could not add amenity");
      }
    });
  }

  function removeFeature(id: string) {
    startTransition(async () => {
      const result = await deleteFeature(id);
      if (result.success) setFeatures((prev) => prev.filter((f) => f.id !== id));
      else toast.error(result.error || "Could not delete");
    });
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg text-charcoal">Property Categories</h2>
        <p className="mt-1 text-xs text-muted-foreground">Apartments, Villas and Riads are fixed — you can rename their display labels.</p>
        <div className="mt-4 space-y-3">
          {types.map((t) => (
            <div key={t.id} className="flex items-center gap-2">
              <Input
                defaultValue={t.name}
                onBlur={(e) => {
                  setTypes((prev) => prev.map((p) => (p.id === t.id ? { ...p, name: e.target.value } : p)));
                  saveType(t.id, e.target.value);
                }}
              />
              <span className="w-24 shrink-0 text-xs text-muted-foreground">/{t.slug}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg text-charcoal">Amenities &amp; Features</h2>
        <div className="mt-4 flex gap-2">
          <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Rooftop Terrace" />
          <Button size="icon" onClick={addFeature} disabled={isPending}><Plus className="size-4" /></Button>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {features.map((f) => {
            const Icon = getFeatureIcon(f.icon);
            return (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-bronze" /> {f.name}
                </span>
                <button type="button" onClick={() => removeFeature(f.id)} className="text-muted-foreground hover:text-destructive">
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
