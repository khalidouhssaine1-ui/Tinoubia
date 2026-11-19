/**
 * Extracts the canonical Instagram embed URL from a pasted reel/post/tv link.
 * Returns null if the URL isn't a recognisable Instagram post link.
 * The `/embed` iframe renders without any API token or embed script.
 */
export function instagramEmbedUrl(url: string): string | null {
  const match = url.match(/instagram\.com\/(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (!match) return null;
  const type = match[1].toLowerCase() === "reels" ? "reel" : match[1].toLowerCase();
  const shortcode = match[2];
  return `https://www.instagram.com/${type}/${shortcode}/embed`;
}

export function isValidInstagramUrl(url: string): boolean {
  return instagramEmbedUrl(url) !== null;
}
