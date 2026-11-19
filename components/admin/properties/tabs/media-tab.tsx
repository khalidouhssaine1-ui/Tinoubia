import { MediaManager } from "@/components/admin/properties/media-manager";
import { BrochureUploader } from "@/components/admin/properties/brochure-uploader";
import type { PropertyMedia } from "@/types";

export function MediaTab({
  propertyId,
  media,
  brochureUrl,
}: {
  propertyId: string;
  media: PropertyMedia[];
  brochureUrl: string | null;
}) {
  return (
    <div className="space-y-6">
      <MediaManager propertyId={propertyId} initialMedia={media} />
      <BrochureUploader propertyId={propertyId} initialUrl={brochureUrl} />
    </div>
  );
}
