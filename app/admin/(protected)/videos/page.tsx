import type { Metadata } from "next";
import { requireProfile } from "@/lib/permissions";
import { VideosManager } from "@/components/admin/videos-manager";
import { getInstagramVideos } from "@/lib/data/videos";

export const metadata: Metadata = { title: "Instagram Videos" };

export default async function AdminVideosPage() {
  await requireProfile();
  const videos = await getInstagramVideos();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-charcoal">Instagram Videos</h1>
        <p className="text-sm text-muted-foreground">
          Showcase your Instagram reels on the homepage to build trust with visitors.
        </p>
      </div>
      <VideosManager videos={videos} />
    </div>
  );
}
