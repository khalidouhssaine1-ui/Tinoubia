import { NextResponse, type NextRequest } from "next/server";
import { requireProfile } from "@/lib/permissions";
import { createSignedUploadParams } from "@/lib/cloudinary/sign";

const FOLDERS: Record<string, string> = {
  properties: "tinoubia/properties",
  brochures: "tinoubia/brochures",
  categories: "tinoubia/categories",
};

export async function POST(request: NextRequest) {
  // Signed upload credentials are only ever issued to authenticated staff —
  // never to anonymous visitors — since they permit writing to Cloudinary.
  try {
    await requireProfile();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as { folder?: string };
  const folder = FOLDERS[body.folder ?? "properties"] ?? FOLDERS.properties;

  const params = createSignedUploadParams(folder);
  return NextResponse.json(params);
}
