/**
 * Generates maskable-friendly PNG icons for the PWA manifest (Steel Violet brand).
 * Run: node scripts/generate-pwa-icons.mjs
 * Requires: sharp (devDependency)
 */
import { mkdirSync } from "node:fs";
import sharp from "sharp";

const VIOLET = { r: 0x63, g: 0x20, b: 0xb3, alpha: 1 };

mkdirSync("public/icons", { recursive: true });

async function solidPng(size, outPath) {
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: VIOLET,
    },
  })
    .png()
    .toFile(outPath);
}

await solidPng(192, "public/icons/icon-192.png");
await solidPng(512, "public/icons/icon-512.png");
await solidPng(180, "public/apple-touch-icon.png");

console.log("PWA icons written to public/icons/ and public/apple-touch-icon.png");
