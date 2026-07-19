/**
 * Global next/image loader (wired via next.config images.loaderFile).
 * A loader passed as a per-<Image> prop can't cross the server/client
 * boundary in the App Router, so this is the only supported place for it.
 */
export default function cloudinaryImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Local /public assets (logo, hero image) — served as-is, no transform.
  if (src.startsWith("/")) return src;

  if (src.includes("res.cloudinary.com")) {
    const q = quality ?? "auto";
    return src.replace("/upload/", `/upload/f_auto,q_${q},w_${width}/`);
  }

  // Unsplash (demo seed data) already supports its own resize query params.
  if (src.includes("images.unsplash.com")) {
    const url = new URL(src);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 80));
    return url.toString();
  }

  return src;
}
