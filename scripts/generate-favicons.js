// scripts/generate-favicons.js
// Generates official e-Gurukulam brand mark favicons strictly conforming to Google Search favicon specifications.
// Produces square 1:1 icons at 48x48, 96x96, 180x180, 192x192, 512x512, and multi-size favicon.ico.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCE_LOGO = path.resolve(__dirname, '../public/images/Logo.png');
const PUBLIC_DIR = path.resolve(__dirname, '../public');
const DIST_DIR = path.resolve(__dirname, '../dist');

// Bounding box of the emblem mark inside Logo.png (1600x572)
// Emblem Center: X=327, Y=287. Square 410x410: Left=122, Top=82
const CROP_BOX = { left: 122, top: 82, width: 410, height: 410 };

// Create binary multi-resolution ICO file from PNG buffers
function createIco(pngBuffers) {
  const count = pngBuffers.length;
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // ICO format
  header.writeUInt16LE(count, 4); // Number of images

  let offset = 6 + count * 16;
  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.width >= 256 ? 0 : item.width, 0);
    entry.writeUInt8(item.height >= 256 ? 0 : item.height, 1);
    entry.writeUInt8(0, 2); // Colors
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // Size of image
    entry.writeUInt32LE(offset, 12); // Offset
    entries.push(entry);
    offset += item.buffer.length;
  }

  return Buffer.concat([header, ...entries, ...pngBuffers.map(b => b.buffer)]);
}

async function generateFavicons() {
  console.log('[Favicons] Reading master brand logo from:', SOURCE_LOGO);
  if (!fs.existsSync(SOURCE_LOGO)) {
    throw new Error(`Master logo not found at: ${SOURCE_LOGO}`);
  }

  // Base emblem cropped tightly with square 1:1 aspect ratio
  const emblemPipeline = sharp(SOURCE_LOGO).extract(CROP_BOX);

  // 1. Generate PNGs across required resolutions
  const targets = [
    { size: 48, filename: 'favicon-48x48.png', desc: 'Google Search standard 48px square favicon' },
    { size: 96, filename: 'favicon-96x96.png', desc: 'Hi-dpi 2x standard favicon' },
    { size: 180, filename: 'apple-touch-icon.png', desc: 'Apple Touch Icon 180x180' },
    { size: 192, filename: 'favicon-192x192.png', desc: 'Android / Google Search Hi-res 192x192' },
    { size: 512, filename: 'favicon-512x512.png', desc: 'PWA / Large Web App icon 512x512' }
  ];

  for (const t of targets) {
    const outPath = path.join(PUBLIC_DIR, t.filename);
    await emblemPipeline
      .clone()
      .resize(t.size, t.size, { fit: 'contain' })
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`[Favicons] Generated ${t.filename} (${t.size}x${t.size}) - ${t.desc}`);

    // If dist exists, sync directly
    if (fs.existsSync(DIST_DIR)) {
      fs.copyFileSync(outPath, path.join(DIST_DIR, t.filename));
    }
  }

  // 2. Generate multi-resolution favicon.ico (16x16, 32x32, 48x48)
  const ico16 = await emblemPipeline.clone().resize(16, 16).png().toBuffer();
  const ico32 = await emblemPipeline.clone().resize(32, 32).png().toBuffer();
  const ico48 = await emblemPipeline.clone().resize(48, 48).png().toBuffer();

  const icoBuffer = createIco([
    { width: 16, height: 16, buffer: ico16 },
    { width: 32, height: 32, buffer: ico32 },
    { width: 48, height: 48, buffer: ico48 }
  ]);

  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('[Favicons] Generated multi-resolution favicon.ico (16x16, 32x32, 48x48)');

  if (fs.existsSync(DIST_DIR)) {
    fs.copyFileSync(icoPath, path.join(DIST_DIR, 'favicon.ico'));
  }

  console.log('[Favicons] All Google Search compliant favicon assets generated successfully!');
}

generateFavicons().catch(err => {
  console.error('[Favicons] Failed to generate favicons:', err);
  process.exit(1);
});
