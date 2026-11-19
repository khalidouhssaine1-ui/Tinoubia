"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getFeatureIcon } from "@/lib/feature-icons";
import {
  createFeature,
  createPropertyType,
  deleteFeature,
  deletePropertyType,
  updatePropertyType,
} from "@/lib/actions/categories";
import { slugify } from "@/lib/utils";
import type { Feature, PropertyType } from "@/types";

const MAX_IMAGE_MB = 10;

/** Uploads a category photo to Cloudinary (signed server-side) and returns its URL. */
async function uploadCategoryImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) throw new Error(`The photo must be under ${MAX_IMAGE_MB} MB.`);

  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder: "categories" }),
  });
  if (!signRes.ok) throw new Error("Could not prepare the upload. Are you still signed in?");
  const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  const result = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(result?.error?.message || "Upload failed");
  return result.secure_url as string;
}

interface Draft {
  name: string;
  description: string;
  image_url: string;
  sort_order: string;
}

function toDraft(t?: PropertyType): Draft {
  return {
    name: t?.name ?? "",
    description: t?.description ?? "",
    image_url: t?.image_url ?? "",
    sort_order: String(t?.sort_order ?? 0),
  };
}

function CategoryFields({
  draft,
  onChange,
  disabled,
}: {
  draft: Draft;
  onChange: (next: Draft) => void;
  disabled?: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadCategoryImage(file);
      onChange({ ...draft, image_url: url });
      toast.success("Photo uploaded — remember to save");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={disabled || uploading}
        className="group relative flex h-28 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-muted text-muted-foreground transition-colors hover:border-bronze hover:text-bronze sm:w-40"
        aria-label="Upload a category photo"
      >
        {draft.image_url ? (
          <Image src={draft.image_url} alt="" fill sizes="160px" className="object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-xs">
            <ImagePlus className="size-5" /> Add photo
          </span>
        )}
        {draft.image_url && (
          <span className="absolute inset-0 flex items-center justify-center bg-charcoal/50 text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
            Change photo
          </span>
        )}
        {uploading && (
          <span className="absolute inset-0 flex items-center justify-center bg-charcoal/60 text-white">
            <Loader2 className="size-5 animate-spin" />
          </span>
        )}
      </button>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex gap-2">
          <Input
            value={draft.name}
            onChange={(e) => onChange({ ...draft, name: e.target.value })}
            placeholder="Category name, e.g. Land"
            aria-label="Category name"
            disabled={disabled}
          />
          <Input
            type="number"
            min={0}
            max={999}
            value={draft.sort_order}
            onChange={(e) => onChange({ ...draft, sort_order: e.target.value })}
            className="w-20"
            aria-label="Display order"
            title="Display order (lower numbers show first)"
            disabled={disabled}
          />
        </div>
        <Textarea
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
          placeholder="Short description shown on the homepage card"
          aria-label="Category description"
          rows={2}
          maxLength={200}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function CategoryRow({ type, onDeleted }: { type: PropertyType; onDeleted: (id: string) => void }) {
  const [draft, setDraft] = useState<Draft>(() => toDraft(type));
  const [saved, setSaved] = useState<Draft>(() => toDraft(type));
  const [isPending, startTransition] = useTransition();
  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);

  function save() {
    startTransition(async () => {
      const result = await updatePropertyType(type.id, draft);
      if (result.success) {
        setSaved(draft);
        toast.success(`"${draft.name}" saved`);
      } else {
        toast.error(result.error || "Could not save");
      }
    });
  }

  function remove() {
    if (!window.confirm(`Delete the category "${type.name}"? This can't be undone.`)) return;
    startTransition(async () => {
      const result = await deletePropertyType(type.id);
      if (result.success) {
        onDeleted(type.id);
        toast.success(`"${type.name}" deleted`);
      } else {
        toast.error(result.error || "Could not delete");
      }
    });
  }

  return (
    <li className="space-y-3 py-4 first:pt-0 last:pb-0">
      <CategoryFields draft={draft} onChange={setDraft} disabled={isPending} />
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-xs text-muted-foreground">/properties/{type.slug}/for-sale</span>
        <div className="flex shrink-0 gap-2">
          <Button type="button" size="sm" variant="outline" onClick={remove} disabled={isPending} className="text-destructive hover:text-destructive">
            <Trash2 className="size-3.5" /> Delete
          </Button>
          <Button type="button" size="sm" onClick={save} disabled={isPending || !dirty}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save
          </Button>
        </div>
      </div>
    </li>
  );
}

export function CategoriesManager({
  propertyTypes: initialTypes,
  features: initialFeatures,
}: {
  propertyTypes: PropertyType[];
  features: Feature[];
}) {
  const [types, setTypes] = useState(initialTypes);
  const [features, setFeatures] = useState(initialFeatures);
  const [newType, setNewType] = useState<Draft>(() => toDraft());
  const [newFeature, setNewFeature] = useState("");
  const [isPending, startTransition] = useTransition();

  function addType() {
    if (!newType.name.trim()) {
      toast.error("Give the category a name first.");
      return;
    }
    startTransition(async () => {
      const result = await createPropertyType(newType);
      if (result.success && result.id) {
        setTypes((prev) => [
          ...prev,
          {
            id: result.id!,
            name: newType.name.trim(),
            slug: slugify(newType.name),
            icon: null,
            description: newType.description || null,
            image_url: newType.image_url || null,
            sort_order: Number(newType.sort_order) || 0,
          },
        ]);
        setNewType(toDraft());
        toast.success("Category added");
      } else {
        toast.error(result.error || "Could not add category");
      }
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
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[3fr_2fr]">
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg text-charcoal">Add a Category</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            New categories appear in the menu, footer, search filters and on the homepage.
          </p>
          <div className="mt-4 space-y-3">
            <CategoryFields draft={newType} onChange={setNewType} disabled={isPending} />
            <div className="flex justify-end">
              <Button type="button" onClick={addType} disabled={isPending}>
                {isPending ? <Loader2 className="size-4 animate-spin" /> : <Plus className="size-4" />} Add category
              </Button>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="font-heading text-lg text-charcoal">Property Categories</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Edit a category&apos;s name, description, photo or order, then press Save. A category can only be
            deleted once no property uses it.
          </p>
          <ul className="mt-4 divide-y divide-border">
            {types.map((t) => (
              <CategoryRow key={t.id} type={t} onDeleted={(id) => setTypes((prev) => prev.filter((p) => p.id !== id))} />
            ))}
          </ul>
        </div>
      </div>

      <div className="h-fit rounded-2xl border border-border bg-card p-5">
        <h2 className="font-heading text-lg text-charcoal">Amenities &amp; Features</h2>
        <div className="mt-4 flex gap-2">
          <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="e.g. Rooftop Terrace" />
          <Button size="icon" onClick={addFeature} disabled={isPending} aria-label="Add amenity"><Plus className="size-4" /></Button>
        </div>
        <ul className="mt-3 divide-y divide-border">
          {features.map((f) => {
            const Icon = getFeatureIcon(f.icon);
            return (
              <li key={f.id} className="flex items-center justify-between py-2 text-sm">
                <span className="flex items-center gap-2">
                  <Icon className="size-4 text-bronze" /> {f.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFeature(f.id)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Delete ${f.name}`}
                >
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
