import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the project root. Without this, Turbopack walks up looking for a
  // lockfile and can pick a stray one in a parent folder (e.g. the home
  // directory), making that whole folder the root it resolves and watches.
  turbopack: {
    root: __dirname,
  },
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary/image-loader.ts",
  },
};

export default nextConfig;
