// The header uses just the skyline mark + "TINOUBIA" wordmark, without the
// "IMMOBILIER" bar underneath (that stays in the full lockup used elsewhere,
// e.g. the footer). Crops both the dark-ink and white variants at the same
// row (found by profiling alpha density — rows 622-656 are a clean gap
// between the text baseline and the bar) and trims the transparent margin.
import sharp from "sharp";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CROP_HEIGHT = 640;

async function cropOne(srcName, destName) {
  const src = path.join(__dirname, "..", "public", srcName);
  const dest = path.join(__dirname, "..", "public", destName);
  const meta = await sharp(src).metadata();

  await sharp(src)
    .extract({ left: 0, top: 0, width: meta.width, height: CROP_HEIGHT })
    .trim()
    .png()
    .toFile(dest);
}

await cropOne("logo.png", "logo-header.png");
await cropOne("logo-white.png", "logo-header-white.png");

console.log("Done — logo-header.png / logo-header-white.png written.");
