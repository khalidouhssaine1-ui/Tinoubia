import { NextResponse } from "next/server";
import { requireProfile } from "@/lib/permissions";
import { createSignedUploadParams } from "@/lib/cloudinary/sign";

export async function POST() {
  // Signed upload credentials are only ever issued to authenticated staff —
  // never to anonymous visitors — since they permit writing to Cloudinary.
  try {
    await requireProfile();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const params = createSignedUploadParams("tinoubia/properties");
  return NextResponse.json(params);
}
