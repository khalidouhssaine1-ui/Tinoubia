// New logo.png (TINOUBIA wordmark) is dark ink on a near-white (not pure
// alpha) canvas. Unlike the old asset (light art on pure black, additive),
// this is ink-on-paper: pixel = ink*alpha + bg*(1-alpha) with bg ~ (255,255,255).
// So alpha = 1 - luminance/255 (clamped/contrast-stretched), color = black.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs/promises";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, "..", "public", "logo.png");

const { data, info } = await sharp(file).raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

const LOW_L = 60; // ink -> fully opaque
const HIGH_L = 245; // background -> fully transparent

const out = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const r = data[i * channels];
  const g = data[i * channels + 1];
  const b = data[i * channels + 2];
  const L = 0.299 * r + 0.587 * g + 0.114 * b;

  let alpha;
  if (L <= LOW_L) alpha = 255;
  else if (L >= HIGH_L) alpha = 0;
  else alpha = Math.round(((HIGH_L - L) * 255) / (HIGH_L - LOW_L));

  out[i * 4] = 0;
  out[i * 4 + 1] = 0;
  out[i * 4 + 2] = 0;
  out[i * 4 + 3] = alpha;
}

const tmp = file + ".tmp.png";
await sharp(out, { raw: { width, height, channels: 4 } }).trim().png().toFile(tmp);
await fs.rename(tmp, file);

console.log("Done — logo.png background keyed out, ink kept as black-alpha.");
