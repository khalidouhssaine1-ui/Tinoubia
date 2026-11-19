"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/permissions";
import { logActivity } from "@/lib/actions/activity-log";
import { isValidInstagramUrl } from "@/lib/instagram";
import type { ActionResult } from "@/lib/actions/properties";

export async function addInstagramVideo(input: { url: string; caption?: string }): Promise<ActionResult> {
  const profile = await requireProfile();

  const url = input.url.trim();
  // Accept either an Instagram link OR a hosted video file URL (Cloudinary
  // upload) — the latter plays inline on the site, keeping visitors here.
  const isHostedVideo = /^https:\/\/\S+/i.test(url);
  if (!isValidInstagramUrl(url) && !isHostedVideo) {
    return { success: false, error: "Add an Instagram link or upload a video file." };
  }

  const supabase = await createClient();

  const { data: maxPos } = await supabase
    .from("instagram_videos")
    .select("position")
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  const position = ((maxPos as { position: number } | null)?.position ?? -1) + 1;

  const { data, error } = await supabase
    .from("instagram_videos")
    .insert({ url, caption: input.caption?.trim() || null, position } as never)
    .select("id")
    .single();

  if (error || !data) return { success: false, error: error?.message ?? "Could not add video" };

  await logActivity(profile.id, "add_instagram_video", "instagram_video", (data as { id: string }).id);
  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { success: true, id: (data as { id: string }).id };
}

export async function deleteInstagramVideo(id: string): Promise<ActionResult> {
  const profile = await requireProfile();
  const supabase = await createClient();

  const { error } = await supabase.from("instagram_videos").delete().eq("id", id);
  if (error) return { success: false, error: error.message };

  await logActivity(profile.id, "delete_instagram_video", "instagram_video", id);
  revalidatePath("/admin/videos");
  revalidatePath("/");
  return { success: true };
}
