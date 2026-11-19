"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, UploadCloud, Loader2, Film } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addInstagramVideo, deleteInstagramVideo } from "@/lib/actions/videos";
import { instagramEmbedUrl } from "@/lib/instagram";
import type { InstagramVideo } from "@/types";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const MAX_MB = 100;

export function VideosManager({ videos: initial }: { videos: InstagramVideo[] }) {
  const [videos, setVideos] = useState(initial);
  const [url, setUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const configured = Boolean(CLOUD_NAME);

  function persist(videoUrl: string, cap: string) {
    startTransition(async () => {
      const result = await addInstagramVideo({ url: videoUrl, caption: cap });
      if (result.success && result.id) {
        setVideos((prev) => [
          ...prev,
          { id: result.id!, url: videoUrl, caption: cap.trim() || null, position: prev.length, created_at: new Date().toISOString() },
        ]);
        toast.success("Video added");
      } else {
        toast.error(result.error || "Could not add video");
      }
    });
  }

  function addInstagram() {
    if (!url.trim()) return;
    persist(url.trim(), caption);
    setUrl("");
    setCaption("");
  }

  async function handleUpload(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast.error("Please choose a video file.");
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Video must be under ${MAX_MB} MB.`);
      return;
    }
    if (!configured) {
      toast.error("Cloudinary is not configured yet.");
      return;
    }

    setUploading(true);
    try {
      const signRes = await fetch("/api/cloudinary/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder: "properties" }),
      });
      if (!signRes.ok) throw new Error("Could not sign upload");
      const { timestamp, signature, apiKey, cloudName, folder } = await signRes.json();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", String(timestamp));
      formData.append("signature", signature);
      formData.append("folder", folder);

      const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/video/upload`, {
        method: "POST",
        body: formData,
      });
      const result = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(result?.error?.message || "Upload failed");

      persist(result.secure_url, caption);
      setCaption("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove(id: string) {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    startTransition(async () => {
      const result = await deleteInstagramVideo(id);
      if (!result.success) toast.error(result.error || "Could not delete");
    });
  }

  return (
    <div className="space-y-6">
      {/* Upload a video file — plays inline on the site, no "Watch on Instagram". */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-heading text-lg text-charcoal">
          <Film className="size-4 text-bronze" /> Upload a video (recommended)
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Upload the video file directly — it plays right on the homepage, so visitors never leave the site. (Up to {MAX_MB} MB.)
        </p>
        <input ref={fileRef} type="file" accept="video/*" hidden onChange={(e) => handleUpload(e.target.files?.[0])} />
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Optional caption" className="flex-1" />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading || !configured}
            className="gap-1.5 bg-bronze text-white hover:bg-bronze/90"
          >
            {uploading ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
            {uploading ? "Uploading…" : "Upload video"}
          </Button>
        </div>
        {!configured && <p className="mt-2 text-xs text-destructive">Cloudinary env vars not configured yet.</p>}
      </div>

      {/* Or paste an Instagram link (note: reels show "Watch on Instagram"). */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="flex items-center gap-2 font-heading text-lg text-charcoal">
          <FaInstagram className="size-4 text-bronze" /> …or add an Instagram link
        </h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Paste a reel/post link. Note: Instagram reels only show a preview with a &quot;Watch on Instagram&quot; button — to keep
          visitors on your site, upload the video file above instead.
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://www.instagram.com/reel/…" className="flex-1" />
          <Button onClick={addInstagram} disabled={isPending} variant="outline" className="gap-1.5">
            <Plus className="size-4" /> Add link
          </Button>
        </div>
      </div>

      {videos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center">
          <Film className="size-8 text-muted-foreground" />
          <p className="mt-3 font-medium text-charcoal">No videos yet</p>
          <p className="text-sm text-muted-foreground">Upload your first video to build trust with visitors.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((v) => {
            const embed = instagramEmbedUrl(v.url);
            return (
              <div key={v.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                {embed ? (
                  <iframe src={embed} title={v.caption || "Instagram video"} className="h-72 w-full" loading="lazy" />
                ) : (
                  <video src={v.url} controls playsInline preload="metadata" className="h-72 w-full bg-charcoal object-cover" />
                )}
                <div className="flex items-center justify-between gap-2 p-3">
                  <a
                    href={v.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-xs text-muted-foreground hover:text-bronze"
                  >
                    <ExternalLink className="size-3 shrink-0" />
                    <span className="truncate">{v.caption || (embed ? v.url : "Uploaded video")}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => remove(v.id)}
                    className="shrink-0 text-muted-foreground hover:text-destructive"
                    aria-label="Delete video"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
