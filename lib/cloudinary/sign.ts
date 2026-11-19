import "server-only";
import { cloudinary } from "@/lib/cloudinary/config";

export interface SignedUploadParams {
  timestamp: number;
  signature: string;
  apiKey: string;
  cloudName: string;
  folder: string;
}

/**
 * Signs an upload request server-side so `CLOUDINARY_API_SECRET` never
 * reaches the browser. The client posts directly to Cloudinary with these
 * params attached (unsigned fields must match exactly what was signed).
 */
export function createSignedUploadParams(folder = "tinoubia/properties"): SignedUploadParams {
  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return {
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY!,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!,
    folder,
  };
}

export async function deleteCloudinaryAsset(publicId: string, resourceType: "image" | "video" | "raw") {
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}
