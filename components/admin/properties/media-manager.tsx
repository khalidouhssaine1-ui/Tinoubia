"use client";

import { useCallback, useRef, useState, useTransition } from "react";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2, UploadCloud, Loader2, Video } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  addPropertyMedia,
  deletePropertyMedia,
  reorderPropertyMedia,
  setCoverMedia,
  updatePropertyMediaMeta,
} from "@/lib/actions/media";
import type { PropertyMedia } from "@/types";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function MediaManager({ propertyId, initialMedia }: { propertyId: string; initialMedia: PropertyMedia[] }) {
  const [media, setMedia] = useState(initialMedia);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const configured = Boolean(CLOUD_NAME);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;
      if (!configured) {
        toast.error("Cloudinary is not configured — set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and related env vars.");
        return;
      }

      setUploading(true);
      setProgress({ done: 0, total: files.length });

      const uploaded: {
        cloudinary_public_id: string;
        secure_url: string;
        resource_type: "image" | "video";
        width?: number;
        height?: number;
        duration?: number;
      }[] = [];

      for (const file of Array.from(files)) {
        try {
          const signRes = await fetch("/api/cloudinary/sign", { method: "POST" });
          if (!signRes.ok) throw new Error("Could not sign upload");
          const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

          const formData = new FormData();
          formData.append("file", file);
          formData.append("api_key", apiKey);
          formData.append("timestamp", String(timestamp));
          formData.append("signature", signature);
          formData.append("folder", folder);

          const resourceType = file.type.startsWith("video") ? "video" : "image";
          const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`, {
            method: "POST",
            body: formData,
          });
          const result = await uploadRes.json();
          if (!uploadRes.ok) throw new Error(result?.error?.message || "Upload failed");

          uploaded.push({
            cloudinary_public_id: result.public_id,
            secure_url: result.secure_url,
            resource_type: resourceType,
            width: result.width,
            height: result.height,
            duration: result.duration,
          });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Upload failed");
        }
        setProgress((p) => (p ? { done: p.done + 1, total: p.total } : p));
      }

      if (uploaded.length > 0) {
        const result = await addPropertyMedia(propertyId, uploaded);
        if (result.success) {
          setMedia((prev) => [
            ...prev,
            ...uploaded.map((u, i) => ({
              id: `temp-${Date.now()}-${i}`,
              property_id: propertyId,
              cloudinary_public_id: u.cloudinary_public_id,
              secure_url: u.secure_url,
              resource_type: u.resource_type,
              width: u.width ?? null,
              height: u.height ?? null,
              duration: u.duration ?? null,
              position: prev.length + i,
              alt_text: null,
              caption: null,
              is_cover: prev.length === 0 && i === 0,
              created_at: new Date().toISOString(),
            })),
          ]);
          toast.success(`${uploaded.length} file(s) uploaded`);
        } else {
          toast.error(result.error || "Could not save media");
        }
      }

      setUploading(false);
      setProgress(null);
    },
    [propertyId, configured],
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setMedia((prev) => {
      const oldIndex = prev.findIndex((m) => m.id === active.id);
      const newIndex = prev.findIndex((m) => m.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      startTransition(() => {
        reorderPropertyMedia(propertyId, reordered.map((m) => m.id));
      });
      return reordered;
    });
  }

  async function handleDelete(mediaId: string) {
    setMedia((prev) => prev.filter((m) => m.id !== mediaId));
    const result = await deletePropertyMedia(mediaId, propertyId);
    if (!result.success) toast.error(result.error || "Could not delete media");
  }

  async function handleSetCover(mediaId: string) {
    setMedia((prev) => prev.map((m) => ({ ...m, is_cover: m.id === mediaId })));
    await setCoverMedia(propertyId, mediaId);
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 p-8 text-center hover:border-bronze"
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          hidden
          onChange={(e) => handleFiles(e.target.files)}
        />
        {uploading ? (
          <>
            <Loader2 className="size-6 animate-spin text-bronze" />
            <p className="text-sm text-muted-foreground">
              Uploading {progress?.done ?? 0} / {progress?.total ?? 0}...
            </p>
          </>
        ) : (
          <>
            <UploadCloud className="size-6 text-bronze" />
            <p className="text-sm text-charcoal">Drag &amp; drop images or videos, or click to browse</p>
            {!configured && <p className="text-xs text-destructive">Cloudinary env vars not configured yet.</p>}
          </>
        )}
      </div>

      {media.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={media.map((m) => m.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {media.map((item) => (
                <MediaTile
                  key={item.id}
                  item={item}
                  onDelete={() => handleDelete(item.id)}
                  onSetCover={() => handleSetCover(item.id)}
                  onMetaChange={(data) => updatePropertyMediaMeta(item.id, propertyId, data)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function MediaTile({
  item,
  onDelete,
  onSetCover,
  onMetaChange,
}: {
  item: PropertyMedia;
  onDelete: () => void;
  onSetCover: () => void;
  onMetaChange: (data: { alt_text?: string; caption?: string }) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-2">
      <div className="relative aspect-video overflow-hidden rounded-lg bg-muted">
        {item.resource_type === "video" ? (
          <div className="flex h-full items-center justify-center bg-charcoal text-ivory">
            <Video className="size-6" />
          </div>
        ) : (
          <Image src={item.secure_url} alt={item.alt_text || ""} fill className="object-cover" />
        )}

        <button
          {...attributes}
          {...listeners}
          type="button"
          className="absolute left-1.5 top-1.5 flex size-7 cursor-grab items-center justify-center rounded-md bg-black/50 text-white active:cursor-grabbing"
        >
          <GripVertical className="size-4" />
        </button>

        <button
          type="button"
          onClick={onSetCover}
          className={`absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-md ${item.is_cover ? "bg-bronze text-white" : "bg-black/50 text-white"}`}
          title="Set as cover"
        >
          <Star className={`size-4 ${item.is_cover ? "fill-current" : ""}`} />
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="absolute bottom-1.5 right-1.5 flex size-7 items-center justify-center rounded-md bg-destructive/90 text-white"
          title="Delete"
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <Input
        placeholder="Alt text"
        defaultValue={item.alt_text ?? ""}
        className="h-8 text-xs"
        onBlur={(e) => onMetaChange({ alt_text: e.target.value })}
      />
      <Input
        placeholder="Caption"
        defaultValue={item.caption ?? ""}
        className="h-8 text-xs"
        onBlur={(e) => onMetaChange({ caption: e.target.value })}
      />
    </div>
  );
}
