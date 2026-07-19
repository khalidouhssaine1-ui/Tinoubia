import { MediaManager } from "@/components/admin/properties/media-manager";
import type { PropertyMedia } from "@/types";

export function MediaTab({ propertyId, media }: { propertyId: string; media: PropertyMedia[] }) {
  return <MediaManager propertyId={propertyId} initialMedia={media} />;
}
