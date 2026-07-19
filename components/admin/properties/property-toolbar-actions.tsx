"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Copy, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteProperty, duplicateProperty } from "@/lib/actions/properties";
import { canDeleteProperties } from "@/lib/role-utils";
import type { UserRole } from "@/types";

export function PropertyToolbarActions({
  propertyId,
  slug,
  role,
}: {
  propertyId: string;
  slug: string;
  role: UserRole;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const canDelete = canDeleteProperties(role);

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateProperty(propertyId);
      if (result.success && result.id) {
        toast.success("Property duplicated");
        router.push(`/admin/properties/${result.id}/edit`);
      } else {
        toast.error(result.error || "Could not duplicate");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteProperty(propertyId);
      if (result.success) {
        toast.success("Property deleted");
        router.push("/admin/properties");
      } else {
        toast.error(result.error || "Could not delete");
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" render={<a href={`/properties/${slug}`} target="_blank" rel="noopener noreferrer" />} nativeButton={false} className="gap-1.5">
        <ExternalLink className="size-3.5" /> Preview
      </Button>
      <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={isPending} className="gap-1.5">
        <Copy className="size-3.5" /> Duplicate
      </Button>

      {canDelete && (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger render={<Button variant="outline" size="sm" className="gap-1.5 text-destructive" />}>
            <Trash2 className="size-3.5" /> Delete
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete this property?</AlertDialogTitle>
              <AlertDialogDescription>
                This permanently removes the listing and its media from Cloudinary. This cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-white hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
