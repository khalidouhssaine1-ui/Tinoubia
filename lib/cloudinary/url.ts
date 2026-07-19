/**
 * Client-safe helpers for building Cloudinary delivery URLs with f_auto/q_auto
 * transformations. No secrets involved — cloud name + public id are not sensitive.
 */

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

export function cloudinaryImageUrl(
  publicId: string,
  { width, height, crop = "fill" }: { width?: number; height?: number; crop?: string } = {},
) {
  const transforms = ["f_auto", "q_auto"];
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (width || height) transforms.push(`c_${crop}`);

  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transforms.join(",")}/${publicId}`;
}

export function cloudinaryVideoUrl(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto/${publicId}`;
}

export function cloudinaryVideoThumbnail(publicId: string) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/f_auto,q_auto,so_0/${publicId}.jpg`;
}
