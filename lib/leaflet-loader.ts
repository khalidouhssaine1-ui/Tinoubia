/**
 * Loads Leaflet from the unpkg CDN (script + stylesheet) exactly once and
 * resolves with the global `L`. We use the CDN build rather than a bundled
 * `import("leaflet")` because the UMD module's interop was not initialising
 * reliably under the production bundler — the CDN build is battle-tested and
 * loads deterministically in the browser.
 */
type Leaflet = typeof import("leaflet");

const LEAFLET_VERSION = "1.9.4";
let leafletPromise: Promise<Leaflet> | null = null;

export function loadLeaflet(): Promise<Leaflet> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Leaflet can only load in the browser"));
  }

  const existing = (window as unknown as { L?: Leaflet }).L;
  if (existing) return Promise.resolve(existing);
  if (leafletPromise) return leafletPromise;

  leafletPromise = new Promise<Leaflet>((resolve, reject) => {
    if (!document.querySelector("link[data-leaflet]")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.css`;
      link.setAttribute("data-leaflet", "");
      document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist/leaflet.js`;
    script.async = true;
    script.onload = () => {
      const L = (window as unknown as { L?: Leaflet }).L;
      if (L) resolve(L);
      else reject(new Error("Leaflet loaded but window.L is missing"));
    };
    script.onerror = () => reject(new Error("Failed to load Leaflet from CDN"));
    document.head.appendChild(script);
  });

  return leafletPromise;
}
